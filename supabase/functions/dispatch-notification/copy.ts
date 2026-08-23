/**
 * Texto de cada notificação, em um lugar só.
 *
 * Regra de escrita: o título diz O QUE aconteceu, o corpo diz QUAL vaga.
 * Push é lido de relance na tela bloqueada — se a pessoa precisar abrir
 * para entender do que se trata, o texto falhou.
 */

export type EventoNotificacao =
  | "job.published.nearby"
  | "application.received"
  | "application.selected"
  | "application.rejected"
  | "message.received"
  | "job.cancelled"
  | "job.reminder"
  | "rating.received";

export type Canais = { push: boolean; email: boolean };

type Montado = {
  titulo: string;
  corpo: string;
  rota: string;
  canais: Canais;
  /** Ignora horário de silêncio (só vaga urgente, e só se a pessoa permitir). */
  podeFurarSilencio: boolean;
};

export function montarNotificacao(
  evento: EventoNotificacao,
  payload: Record<string, unknown>
): Montado {
  const titulo = String(payload.titulo ?? "uma vaga");
  const cidade = payload.cidade ? ` · ${payload.cidade}` : "";
  const urgente = payload.is_urgent === true;

  switch (evento) {
    case "job.published.nearby":
      return {
        titulo: urgente ? "Vaga urgente perto de você" : "Nova vaga na sua região",
        corpo: `${titulo}${cidade}`,
        rota: `/vaga/${payload.job_id}`,
        // E-mail só quando é urgente: push perdido é vaga perdida.
        canais: { push: true, email: urgente },
        podeFurarSilencio: urgente
      };

    case "application.received":
      return {
        titulo: "Nova candidatura",
        corpo: `Alguém se candidatou a ${titulo}`,
        rota: `/vaga/${payload.job_id}/candidatos`,
        canais: { push: true, email: true },
        podeFurarSilencio: false
      };

    case "application.selected":
      return {
        titulo: "Você foi escolhido!",
        corpo: `${titulo} é sua. Combine os detalhes pelo chat.`,
        rota: `/vaga/${payload.job_id}`,
        canais: { push: true, email: true },
        podeFurarSilencio: false
      };

    case "application.rejected":
      return {
        titulo: "Vaga preenchida",
        corpo: `${titulo} seguiu com outro profissional.`,
        rota: `/candidaturas`,
        canais: { push: true, email: false },
        podeFurarSilencio: false
      };

    case "message.received":
      return {
        titulo: "Nova mensagem",
        corpo: String(payload.preview ?? "Você recebeu uma mensagem"),
        rota: `/conversa/${payload.conversation_id}`,
        canais: { push: true, email: false },
        podeFurarSilencio: false
      };

    case "job.cancelled":
      return {
        titulo: "Vaga cancelada",
        corpo: `${titulo} foi cancelada pelo contratante.`,
        rota: `/candidaturas`,
        canais: { push: true, email: true },
        podeFurarSilencio: false
      };

    case "job.reminder":
      return {
        titulo: "É amanhã",
        corpo: `${titulo}${cidade}`,
        rota: `/vaga/${payload.job_id}`,
        canais: { push: true, email: false },
        podeFurarSilencio: false
      };

    case "rating.received":
      return {
        titulo: "Você recebeu uma avaliação",
        corpo: `${payload.nota ?? "—"} de 5 estrelas em ${titulo}`,
        rota: `/perfil`,
        canais: { push: true, email: false },
        podeFurarSilencio: false
      };
  }
}

/** Qual preferência do usuário governa cada evento. */
export function chavePreferencia(evento: EventoNotificacao): {
  push: string;
  email: string | null;
} {
  switch (evento) {
    case "job.published.nearby":
      return { push: "push_vagas", email: "email_vagas" };
    case "application.received":
      return { push: "push_candidaturas", email: "email_candidaturas" };
    case "application.selected":
    case "application.rejected":
    case "job.cancelled":
    case "rating.received":
    case "job.reminder":
      return { push: "push_status", email: "email_candidaturas" };
    case "message.received":
      return { push: "push_chat", email: null };
  }
}

export function emailHtml(m: Montado, appUrl: string): string {
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#000;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:24px">
          <span style="color:#D81368;font-size:12px;font-weight:700;letter-spacing:2px">SOLLO BUSINESS</span>
        </td></tr>
        <tr><td style="padding-bottom:12px">
          <h1 style="margin:0;color:#fff;font-size:26px;line-height:1.15;letter-spacing:-0.5px">${escapar(m.titulo)}</h1>
        </td></tr>
        <tr><td style="padding-bottom:28px">
          <p style="margin:0;color:rgba(255,255,255,0.62);font-size:15px;line-height:1.5">${escapar(m.corpo)}</p>
        </td></tr>
        <tr><td>
          <a href="${appUrl}${m.rota}" style="display:inline-block;background:#D81368;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:1px">ABRIR NO APP</a>
        </td></tr>
        <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.16);margin-top:32px">
          <p style="margin:24px 0 0;color:rgba(255,255,255,0.34);font-size:12px;line-height:1.5">
            Você recebeu este e-mail porque ativou avisos de vaga na Sollo Business.
            Dá para ajustar isso em Notificações, dentro do app.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapar(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}
