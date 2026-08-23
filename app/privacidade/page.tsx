import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Política de privacidade: ${site.name}`,
  description: "Como a Sollo Business trata os dados dos usuários."
};

export default function Privacidade() {
  return (
    <main className="section legal" style={{ paddingTop: "8rem" }}>
      <div className="wrap legal__wrap">
        <Link href="/" className="legal__back">
          ← Voltar
        </Link>
        <h1 className="h2">Política de privacidade</h1>
        <p className="legal__updated">Última atualização: 22 de agosto de 2026.</p>

        <p>
          Esta política explica quais dados a Sollo Business coleta, para quê, e quais direitos
          você tem sobre eles, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <h2>1. Dados que coletamos</h2>
        <p>Coletamos apenas o que o produto precisa para funcionar:</p>
        <ul>
          <li>
            <strong>Cadastro:</strong> nome, e-mail, senha (armazenada de forma criptografada pelo
            provedor de autenticação) e tipo de conta.
          </li>
          <li>
            <strong>Perfil:</strong> foto, biografia, categorias de atuação, portfólio e, para
            contratantes, dados da empresa.
          </li>
          <li>
            <strong>Localização:</strong> a base de atuação do profissional é salva com precisão
            reduzida (~1 km), o suficiente para calcular distância até uma vaga sem expor o
            endereço exato de quem mora ali. O endereço de uma vaga é salvo com precisão total,
            porque é um local de trabalho, não a casa de alguém.
          </li>
          <li>
            <strong>Uso do app:</strong> vagas publicadas, candidaturas, mensagens de chat,
            avaliações e token do dispositivo para envio de notificações push.
          </li>
        </ul>

        <h2>2. Para que usamos</h2>
        <p>
          Para operar as funções do app: mostrar vagas dentro do raio de cada profissional,
          notificar sobre vagas urgentes e novidades de candidatura, viabilizar o chat entre as
          partes e exibir o perfil e as avaliações de cada usuário a quem for relevante decidir
          uma contratação.
        </p>

        <h2>3. Com quem compartilhamos</h2>
        <p>
          Não vendemos dados pessoais. Usamos provedores que processam dados em nosso nome sob
          contrato: <strong>Supabase</strong> (banco de dados e autenticação), <strong>Resend</strong>{" "}
          (envio de e-mail) e os serviços de push do sistema operacional (<strong>Apple/Google</strong>).
          Seu perfil público (nome, foto, portfólio, avaliações) é visível a outros usuários da
          plataforma. É o que permite ser encontrado e contratado.
        </p>

        <h2>4. Por quanto tempo guardamos</h2>
        <p>
          Enquanto sua conta existir. Ao excluir a conta pelo app, seus dados de perfil, vagas,
          candidaturas, conversas e avaliações são apagados permanentemente do banco de produção.
        </p>

        <h2>5. Seus direitos</h2>
        <p>Você pode, a qualquer momento:</p>
        <ul>
          <li>Editar os dados do seu perfil diretamente no app.</li>
          <li>Excluir sua conta e todos os dados vinculados, em Perfil → Configurações.</li>
          <li>
            Pedir uma cópia dos seus dados ou tirar dúvidas sobre este processamento pelo{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </li>
        </ul>

        <h2>6. Notificações</h2>
        <p>
          Você controla quais notificações recebe (push e e-mail) e pode configurar horário de
          silêncio na tela de preferências do app.
        </p>

        <h2>7. Contato</h2>
        <p>
          Para qualquer solicitação sobre seus dados: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </main>
  );
}
