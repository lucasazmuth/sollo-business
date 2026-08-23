/**
 * dispatch-notification — o ponto único de saída das notificações.
 *
 * Fluxo: trigger no banco grava em `notification_events` (outbox) → webhook
 * chama esta função → ela resolve destinatários, aplica preferências,
 * grava o inbox e dispara push (Expo) e e-mail (Resend).
 *
 * Nada no app nem no banco envia notificação por fora daqui.
 */
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  chavePreferencia,
  emailHtml,
  montarNotificacao,
  type EventoNotificacao
} from "./copy.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DISPATCH_SECRET = Deno.env.get("DISPATCH_SECRET");
const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Sollo Business <onboarding@resend.dev>";
const APP_URL = Deno.env.get("APP_DEEP_LINK") ?? "sollo:/";
const FUSO = "America/Sao_Paulo";

const EXPO_PUSH = "https://exp.host/--/api/v2/push/send";
const LOTE_PUSH = 100; // limite da API do Expo por request

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  // A função é chamada pelo banco, não por um usuário: em vez de JWT,
  // um segredo compartilhado guardado no Vault.
  if (DISPATCH_SECRET && req.headers.get("x-sollo-secret") !== DISPATCH_SECRET) {
    return json({ error: "não autorizado" }, 401);
  }

  let corpo: { event_id?: string; record?: { id?: string } };
  try {
    corpo = await req.json();
  } catch {
    return json({ error: "payload inválido" }, 400);
  }

  const eventId = corpo.event_id ?? corpo.record?.id;
  if (!eventId) return json({ error: "event_id ausente" }, 400);

  try {
    const resultado = await processar(eventId);
    return json(resultado);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    await db
      .from("notification_events")
      .update({ error: mensagem, attempts: 1 })
      .eq("id", eventId);
    return json({ error: mensagem }, 500);
  }
});

async function processar(eventId: string) {
  const { data: evento } = await db
    .from("notification_events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (!evento) throw new Error("evento não encontrado");
  if (evento.processed_at) return { pulado: "já processado" };

  const tipo = evento.evento as EventoNotificacao;
  const payload = (evento.payload ?? {}) as Record<string, unknown>;

  // Destinatários: explícitos na outbox, ou resolvidos por raio.
  let alvos: string[] = evento.target_ids ?? [];
  if (alvos.length === 0 && tipo === "job.published.nearby") {
    const { data, error } = await db.rpc("candidates_for_job", { p_job_id: payload.job_id });
    if (error) throw new Error(`falha ao resolver o raio: ${error.message}`);
    alvos = (data ?? []).map((r: { profile_id: string }) => r.profile_id);
  }

  // Nunca notificar quem causou o evento.
  alvos = [...new Set(alvos)].filter((id) => id !== evento.actor_id);

  if (alvos.length === 0) {
    await marcarProcessado(eventId);
    return { destinatarios: 0, push: 0, email: 0 };
  }

  const montado = montarNotificacao(tipo, payload);
  const chaves = chavePreferencia(tipo);

  const [prefsRes, perfisRes] = await Promise.all([
    db.from("notification_prefs").select("*").in("profile_id", alvos),
    db.from("profiles").select("id, nome").in("id", alvos)
  ]);

  if (prefsRes.error) throw new Error(`falha ao ler preferências: ${prefsRes.error.message}`);
  if (perfisRes.error) throw new Error(`falha ao ler perfis: ${perfisRes.error.message}`);

  const prefs = prefsRes.data;
  const perfis = perfisRes.data;

  const prefPorId = new Map((prefs ?? []).map((p) => [p.profile_id, p]));
  const nomePorId = new Map((perfis ?? []).map((p) => [p.id, p.nome]));
  const silencio = dentroDoSilencio();

  // ---------- inbox ----------
  // Dedupe explícito. O índice único parcial em `notifications` não serve
  // de árbitro para ON CONFLICT (Postgres 42P10), então a checagem é feita
  // aqui e o índice fica como última trava contra corrida entre dispatches.
  if (tipo === "job.published.nearby" && payload.job_id) {
    const { data: jaNotificados, error } = await db
      .from("notifications")
      .select("profile_id")
      .eq("evento", tipo)
      .filter("data->>job_id", "eq", String(payload.job_id))
      .in("profile_id", alvos);

    if (error) throw new Error(`falha ao checar duplicatas: ${error.message}`);

    const repetidos = new Set((jaNotificados ?? []).map((n) => n.profile_id));
    alvos = alvos.filter((id) => !repetidos.has(id));

    if (alvos.length === 0) {
      await marcarProcessado(eventId);
      return { destinatarios: 0, push: 0, email: 0, nota: "todos já haviam sido notificados" };
    }
  }

  const linhas = alvos.map((profile_id) => ({
    profile_id,
    evento: tipo,
    titulo: montado.titulo,
    corpo: montado.corpo,
    data: { ...payload, rota: montado.rota }
  }));

  const { data: criadas, error: erroInbox } = await db
    .from("notifications")
    .insert(linhas)
    .select("id, profile_id");

  // Falhar alto: erro engolido aqui vira notificação que nunca chega
  // e evento marcado como processado — a pior combinação possível.
  if (erroInbox) throw new Error(`falha ao gravar inbox: ${erroInbox.message}`);

  const novas = criadas ?? [];
  if (novas.length === 0) throw new Error("inbox não gravou nenhuma linha");

  const idsNovos = novas.map((n) => n.profile_id);

  // ---------- push ----------
  const podemPush = idsNovos.filter((id) => {
    const p = prefPorId.get(id);
    if (!p) return false;
    if (!p[chaves.push as keyof typeof p]) return false;
    if (silencio) {
      // Só vaga urgente fura o silêncio, e só se a pessoa permitiu.
      return montado.podeFurarSilencio && p.urgente_ignora_silencio;
    }
    return true;
  });

  const enviadosPush = podemPush.length > 0 ? await enviarPush(podemPush, montado, novas) : 0;

  // ---------- e-mail ----------
  let enviadosEmail = 0;
  if (montado.canais.email && chaves.email) {
    const podemEmail = idsNovos.filter((id) => {
      const p = prefPorId.get(id);
      return p && p[chaves.email as keyof typeof p];
    });
    if (podemEmail.length > 0) {
      enviadosEmail = await enviarEmails(podemEmail, montado, novas, nomePorId);
    }
  }

  await marcarProcessado(eventId);

  return {
    evento: tipo,
    destinatarios: alvos.length,
    novos: novas.length,
    push: enviadosPush,
    email: enviadosEmail,
    silencio
  };
}

async function enviarPush(
  profileIds: string[],
  montado: ReturnType<typeof montarNotificacao>,
  novas: { id: string; profile_id: string }[]
): Promise<number> {
  const { data: tokens } = await db
    .from("device_tokens")
    .select("expo_token, profile_id")
    .in("profile_id", profileIds);

  if (!tokens || tokens.length === 0) return 0;

  const notifPorPerfil = new Map(novas.map((n) => [n.profile_id, n.id]));
  const mensagens = tokens.map((t) => ({
    to: t.expo_token,
    title: montado.titulo,
    body: montado.corpo,
    sound: "default",
    priority: "high",
    channelId: "default",
    data: { rota: montado.rota, notification_id: notifPorPerfil.get(t.profile_id) }
  }));

  let ok = 0;
  const entregas: Record<string, unknown>[] = [];
  const paraRemover: string[] = [];

  for (let i = 0; i < mensagens.length; i += LOTE_PUSH) {
    const lote = mensagens.slice(i, i + LOTE_PUSH);
    const resp = await fetch(EXPO_PUSH, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(lote)
    });

    const json = await resp.json().catch(() => ({}));
    const tickets = json?.data ?? [];

    tickets.forEach((t: { status?: string; id?: string; message?: string; details?: { error?: string } }, k: number) => {
      const token = lote[k].to;
      const perfil = tokens[i + k].profile_id;
      const notifId = notifPorPerfil.get(perfil);

      if (t?.status === "ok") ok++;
      // Aparelho desinstalou o app: o token morreu, tirar da base.
      if (t?.details?.error === "DeviceNotRegistered") paraRemover.push(token);

      if (notifId) {
        entregas.push({
          notification_id: notifId,
          canal: "push",
          status: t?.status === "ok" ? "enviado" : "falhou",
          provider_id: t?.id ?? null,
          error: t?.message ?? null
        });
      }
    });
  }

  if (entregas.length > 0) {
    await db.from("notification_deliveries").upsert(entregas, {
      onConflict: "notification_id,canal",
      ignoreDuplicates: true
    });
  }
  if (paraRemover.length > 0) {
    await db.from("device_tokens").delete().in("expo_token", paraRemover);
  }

  return ok;
}

async function enviarEmails(
  profileIds: string[],
  montado: ReturnType<typeof montarNotificacao>,
  novas: { id: string; profile_id: string }[],
  nomePorId: Map<string, string>
): Promise<number> {
  if (!RESEND_KEY) {
    console.warn("RESEND_API_KEY ausente: e-mail não enviado.");
    return 0;
  }

  // O e-mail mora em auth.users, não em profiles.
  const emails = new Map<string, string>();
  for (const id of profileIds) {
    const { data } = await db.auth.admin.getUserById(id);
    if (data.user?.email) emails.set(id, data.user.email);
  }

  const notifPorPerfil = new Map(novas.map((n) => [n.profile_id, n.id]));
  const html = emailHtml(montado, APP_URL);
  const entregas: Record<string, unknown>[] = [];
  let ok = 0;

  for (const [profileId, email] of emails) {
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [email],
          subject: `${montado.titulo} — ${montado.corpo}`.slice(0, 120),
          html: html.replace("{{nome}}", nomePorId.get(profileId) ?? "")
        })
      });

      const corpo = await resp.json().catch(() => ({}));
      if (resp.ok) ok++;

      const notifId = notifPorPerfil.get(profileId);
      if (notifId) {
        entregas.push({
          notification_id: notifId,
          canal: "email",
          status: resp.ok ? "enviado" : "falhou",
          provider_id: corpo?.id ?? null,
          error: resp.ok ? null : JSON.stringify(corpo).slice(0, 300)
        });
      }
    } catch (e) {
      console.error("falha no envio de e-mail", e);
    }
  }

  if (entregas.length > 0) {
    await db.from("notification_deliveries").upsert(entregas, {
      onConflict: "notification_id,canal",
      ignoreDuplicates: true
    });
  }

  return ok;
}

/** Horário de silêncio no fuso de São Paulo, não no do servidor. */
function dentroDoSilencio(inicio = 22, fim = 7): boolean {
  const agora = new Date();
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO,
      hour: "numeric",
      hour12: false
    }).format(agora)
  );
  return inicio > fim ? hora >= inicio || hora < fim : hora >= inicio && hora < fim;
}

async function marcarProcessado(eventId: string) {
  await db
    .from("notification_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", eventId);
}

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
