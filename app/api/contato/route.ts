import { NextResponse } from "next/server";

/**
 * Recebe o formulário de parcerias.
 *
 * Se a variável de ambiente CONTACT_WEBHOOK_URL estiver definida (Zapier, Make,
 * Slack, Discord, n8n…), o payload é repassado para lá. Sem ela, a rota responde
 * 501 — nenhum envio é simulado como sucesso.
 */
export async function POST(request: Request) {
  let body: { nome?: string; email?: string; projeto?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const nome = body.nome?.trim();
  const email = body.email?.trim();
  const projeto = body.projeto?.trim();

  if (!nome || !email || !projeto) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail e uma descrição do projeto." },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;

  if (!webhook) {
    return NextResponse.json(
      {
        error:
          "Envio ainda não configurado. Defina CONTACT_WEBHOOK_URL nas variáveis de ambiente."
      },
      { status: 501 }
    );
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origem: "sollo.business — formulário de parcerias",
      nome,
      email,
      projeto,
      recebidoEm: new Date().toISOString()
    })
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Não foi possível enviar agora." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
