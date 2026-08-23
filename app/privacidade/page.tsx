import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Política de privacidade: ${site.name}`,
  description: "Como a Sollo Business trata os dados dos usuários."
};

const secoes = [
  { id: "controlador", titulo: "1. Quem trata seus dados" },
  { id: "dados", titulo: "2. Dados que coletamos" },
  { id: "base-legal", titulo: "3. Base legal para o tratamento" },
  { id: "finalidade", titulo: "4. Para que usamos seus dados" },
  { id: "compartilhamento", titulo: "5. Com quem compartilhamos" },
  { id: "transferencia", titulo: "6. Transferência internacional" },
  { id: "retencao", titulo: "7. Por quanto tempo guardamos" },
  { id: "direitos", titulo: "8. Seus direitos" },
  { id: "seguranca", titulo: "9. Segurança" },
  { id: "cookies", titulo: "10. Cookies (site)" },
  { id: "menores", titulo: "11. Menores de idade" },
  { id: "alteracoes", titulo: "12. Alterações desta política" },
  { id: "contato", titulo: "13. Contato e encarregado" }
];

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
          Esta Política de Privacidade explica quais dados pessoais a Sollo Business coleta, por
          quê, com base em qual fundamento legal, com quem compartilha e quais direitos você tem
          sobre eles, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 —
          "LGPD"). Ela é parte integrante dos nossos <Link href="/termos">Termos de Uso</Link>.
        </p>

        <nav className="legal__toc" aria-label="Sumário">
          <span className="legal__tocTitulo">Sumário</span>
          <ol>
            {secoes.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.titulo}</a>
              </li>
            ))}
          </ol>
        </nav>

        <h2 id="controlador">1. Quem trata seus dados</h2>
        <p>
          A Sollo Business é a controladora dos dados pessoais tratados através da Plataforma, nos
          termos do art. 5º, VI, da LGPD. Dúvidas ou solicitações sobre seus dados podem ser
          endereçadas pelo e-mail <a href={`mailto:${site.email}`}>{site.email}</a>, que também
          atende como canal de contato com o encarregado (DPO) até a formalização de um canal
          dedicado.
        </p>

        <h2 id="dados">2. Dados que coletamos</h2>
        <p>Coletamos apenas o que o produto precisa para funcionar:</p>
        <ul>
          <li>
            <strong>Cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada pelo
            provedor de autenticação), tipo de conta.
          </li>
          <li>
            <strong>Perfil:</strong> foto, biografia, categorias de atuação, portfólio e, para
            contratantes, dados da empresa.
          </li>
          <li>
            <strong>Dados cadastrais do contratante</strong> (exigidos antes de publicar a primeira
            vaga): nome completo, CPF, telefone e endereço — necessários para viabilizar a cobrança
            do destaque pago de vagas (ver Termos de Uso, Seção 7) e para reduzir fraude.
          </li>
          <li>
            <strong>Localização:</strong> a base de atuação do profissional é salva com precisão
            reduzida (~1 km), o suficiente para calcular distância até uma vaga sem expor o
            endereço exato de onde a pessoa mora. O endereço de uma vaga é salvo com precisão total,
            porque é um local de trabalho, não a casa de alguém.
          </li>
          <li>
            <strong>Uso do app:</strong> vagas publicadas, candidaturas, mensagens de chat,
            avaliações e token do dispositivo para envio de notificações push.
          </li>
          <li>
            <strong>Dados de pagamento do destaque</strong> (quando essa funcionalidade estiver
            ativa): identificação da transação PIX processada pelo Asaas. A Sollo Business não
            armazena dados sensíveis de pagamento (como chaves PIX de terceiros) — esse
            processamento é feito pelo Asaas, nosso operador de pagamento.
          </li>
        </ul>

        <h2 id="base-legal">3. Base legal para o tratamento</h2>
        <p>Tratamos seus dados com base nas seguintes hipóteses legais do art. 7º da LGPD:</p>
        <ul>
          <li>
            <strong>Execução de contrato:</strong> dados de cadastro, perfil e uso, necessários para
            prestar as funcionalidades da Plataforma que você solicitou ao criar sua conta.
          </li>
          <li>
            <strong>Legítimo interesse:</strong> segurança da Plataforma, prevenção a fraude e
            melhoria do produto, sempre de forma proporcional e sem sobrepor seus direitos
            fundamentais.
          </li>
          <li>
            <strong>Consentimento:</strong> localização precisa (GPS) e envio de notificações push,
            que você autoriza explicitamente no sistema operacional do seu aparelho e pode revogar a
            qualquer momento.
          </li>
          <li>
            <strong>Cumprimento de obrigação legal ou regulatória:</strong> dados cadastrais do
            contratante (CPF, endereço) quando necessários para fins fiscais relacionados à cobrança
            do destaque pago.
          </li>
        </ul>

        <h2 id="finalidade">4. Para que usamos seus dados</h2>
        <p>
          Para operar as funções do app: mostrar vagas dentro do raio de cada profissional,
          notificar sobre vagas urgentes e novidades de candidatura, viabilizar o chat entre as
          partes, exibir o perfil e as avaliações de cada usuário a quem for relevante decidir uma
          contratação, processar o destaque pago de vagas quando essa cobrança estiver ativa, e
          cumprir obrigações legais aplicáveis.
        </p>

        <h2 id="compartilhamento">5. Com quem compartilhamos</h2>
        <p>
          Não vendemos dados pessoais. Usamos operadores que processam dados em nosso nome, sob
          contrato e instruções específicas, nos termos do art. 39 da LGPD:
        </p>
        <ul>
          <li><strong>Supabase</strong> — banco de dados, autenticação e armazenamento de arquivos;</li>
          <li><strong>Resend</strong> — envio de e-mails transacionais;</li>
          <li><strong>Apple e Google</strong> — entrega de notificações push nos respectivos sistemas operacionais;</li>
          <li>
            <strong>Asaas</strong> — processamento do pagamento PIX do destaque de vagas, quando essa
            funcionalidade estiver ativa.
          </li>
        </ul>
        <p>
          Seu perfil público (nome, foto, portfólio, avaliações) é visível a outros usuários da
          Plataforma — é o que permite ser encontrado e contratado. Dados sensíveis (como CPF e
          endereço do contratante) não são exibidos publicamente a outros usuários; ficam
          restritos ao processamento interno e ao operador de pagamento.
        </p>

        <h2 id="transferencia">6. Transferência internacional</h2>
        <p>
          Alguns operadores listados acima (Supabase, Resend, Apple, Google) podem processar dados em
          servidores localizados fora do Brasil. Nesses casos, exigimos que esses operadores adotem
          salvaguardas adequadas de proteção de dados, compatíveis com os padrões exigidos pela LGPD
          para transferência internacional (art. 33).
        </p>

        <h2 id="retencao">7. Por quanto tempo guardamos</h2>
        <p>
          Enquanto sua conta existir. Ao excluir a conta pelo app, seus dados de perfil, vagas,
          candidaturas, conversas e avaliações são apagados permanentemente do banco de produção.
          Dados que precisemos reter por obrigação legal (por exemplo, registros fiscais de
          transações de destaque pago) são mantidos pelo prazo exigido pela legislação aplicável,
          mesmo após a exclusão da conta.
        </p>

        <h2 id="direitos">8. Seus direitos</h2>
        <p>Nos termos do art. 18 da LGPD, você pode, a qualquer momento:</p>
        <ul>
          <li>Confirmar a existência de tratamento e acessar seus dados;</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados — editando o perfil diretamente no app;</li>
          <li>Solicitar a portabilidade dos seus dados a outro fornecedor;</li>
          <li>
            Eliminar seus dados pessoais, excluindo sua conta em{" "}
            <strong>Perfil → Configurações → Excluir minha conta</strong>;
          </li>
          <li>Revogar o consentimento dado (por exemplo, desligando localização ou notificações push no aparelho);</li>
          <li>
            Solicitar informações sobre com quem compartilhamos seus dados, ou pedir revisão de
            decisões automatizadas que eventualmente o afetem.
          </li>
        </ul>
        <p>
          Para exercer qualquer desses direitos, ou tirar dúvidas sobre este processamento, escreva
          para <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2 id="seguranca">9. Segurança</h2>
        <p>
          Adotamos medidas técnicas e administrativas para proteger seus dados: controle de acesso a
          nível de linha no banco de dados (Row Level Security), criptografia de senha pelo provedor
          de autenticação, e revisão periódica de permissões concedidas a funções do sistema. Nenhum
          sistema é 100% imune a incidentes; em caso de incidente de segurança que possa acarretar
          risco relevante, notificaremos a Autoridade Nacional de Proteção de Dados (ANPD) e os
          titulares afetados, conforme exigido pela LGPD.
        </p>

        <h2 id="cookies">10. Cookies (site)</h2>
        <p>
          O aplicativo móvel não usa cookies. O site institucional em{" "}
          <strong>www.sollo.business</strong> pode usar cookies estritamente necessários ao
          funcionamento da página. Não usamos cookies de rastreamento publicitário.
        </p>

        <h2 id="menores">11. Menores de idade</h2>
        <p>
          A Plataforma não é destinada a menores de 18 anos, e não coletamos intencionalmente dados
          de menores. Se tomarmos conhecimento de que uma conta pertence a um menor, ela será
          excluída.
        </p>

        <h2 id="alteracoes">12. Alterações desta política</h2>
        <p>
          Podemos atualizar esta política conforme o produto evolui, em especial quando novas
          funcionalidades de pagamento forem incorporadas. Mudanças relevantes serão avisadas dentro
          do aplicativo.
        </p>

        <h2 id="contato">13. Contato e encarregado</h2>
        <p>
          Para qualquer solicitação sobre seus dados, ou contato com o encarregado de proteção de
          dados: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </main>
  );
}
