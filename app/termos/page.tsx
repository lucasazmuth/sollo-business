import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Termos de uso: ${site.name}`,
  description: "Termos de uso da Sollo Business."
};

const secoes = [
  { id: "definicoes", titulo: "1. Definições" },
  { id: "aceite", titulo: "2. Aceite e capacidade" },
  { id: "natureza", titulo: "3. Natureza do serviço" },
  { id: "conta", titulo: "4. Cadastro e conta" },
  { id: "vagas", titulo: "5. Publicação de vagas" },
  { id: "candidatura", titulo: "6. Candidatura e seleção" },
  { id: "destaque", titulo: "7. Destaque pago" },
  { id: "avaliacoes", titulo: "8. Avaliações" },
  { id: "propriedade", titulo: "9. Conteúdo e propriedade intelectual" },
  { id: "condutas", titulo: "10. Condutas proibidas" },
  { id: "responsabilidade", titulo: "11. Limitação de responsabilidade" },
  { id: "indenizacao", titulo: "12. Indenização" },
  { id: "rescisao", titulo: "13. Vigência, rescisão e exclusão de conta" },
  { id: "alteracoes", titulo: "14. Alterações destes termos" },
  { id: "lei", titulo: "15. Lei aplicável e foro" },
  { id: "contato", titulo: "16. Contato" }
];

export default function Termos() {
  return (
    <main className="section legal" style={{ paddingTop: "8rem" }}>
      <div className="wrap legal__wrap">
        <Link href="/" className="legal__back">
          ← Voltar
        </Link>
        <h1 className="h2">Termos de uso</h1>
        <p className="legal__updated">Última atualização: 22 de agosto de 2026.</p>

        <p>
          Estes Termos de Uso ("Termos") regulam o acesso e uso da plataforma Sollo Business
          ("Plataforma", "nós"), incluindo o aplicativo móvel e eventuais sites associados, operada
          para conectar contratantes a profissionais autônomos do mercado do entretenimento. Ao
          criar uma conta ou utilizar a Plataforma de qualquer forma, você declara que leu,
          compreendeu e concorda integralmente com estes Termos e com a nossa{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
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

        <h2 id="definicoes">1. Definições</h2>
        <p>Para os fins destes Termos:</p>
        <ul>
          <li>
            <strong>Plataforma:</strong> o aplicativo Sollo Business e os serviços de conexão por
            ele oferecidos.
          </li>
          <li>
            <strong>Contratante:</strong> pessoa física ou jurídica que publica vagas ("Anúncios")
            buscando contratar profissionais.
          </li>
          <li>
            <strong>Profissional:</strong> pessoa física autônoma que cria um perfil-vitrine para se
            candidatar a Anúncios.
          </li>
          <li>
            <strong>Anúncio ou Vaga:</strong> publicação criada por um Contratante descrevendo um
            trabalho, com local, data, categoria e demais condições.
          </li>
          <li>
            <strong>Candidatura:</strong> manifestação de interesse de um Profissional em um
            Anúncio.
          </li>
          <li>
            <strong>Usuário:</strong> qualquer Contratante ou Profissional cadastrado na Plataforma.
          </li>
        </ul>

        <h2 id="aceite">2. Aceite e capacidade</h2>
        <p>
          O uso da Plataforma é restrito a maiores de 18 anos, ou a pessoas jurídicas regularmente
          representadas por procurador com poderes para tanto. Ao se cadastrar, você declara possuir
          capacidade civil plena para contratar e que todas as informações fornecidas são
          verdadeiras, completas e atualizadas. Se você não concorda com qualquer disposição destes
          Termos, não utilize a Plataforma.
        </p>

        <h2 id="natureza">3. Natureza do serviço</h2>
        <p>
          A Sollo Business é uma <strong>plataforma de intermediação e descoberta</strong>: ela
          conecta Contratantes a Profissionais, viabiliza a publicação de Anúncios, a candidatura, a
          comunicação por chat e a avaliação mútua após o trabalho. A Sollo Business{" "}
          <strong>
            não é parte, não é empregadora, não é contratante e não é tomadora de serviços
          </strong>{" "}
          em qualquer relação estabelecida entre Contratante e Profissional através da Plataforma.
        </p>
        <p>
          Não existe, e não se pretende criar, qualquer <strong>vínculo empregatício</strong> entre a
          Sollo Business e os Usuários, nem entre Contratante e Profissional em decorrência do uso da
          Plataforma. O Profissional atua como prestador de serviços autônomo, por sua conta e risco,
          sendo o próprio responsável por suas obrigações fiscais, previdenciárias e trabalhistas
          (quando aplicável), assim como o Contratante é o único responsável por observar a
          legislação aplicável à contratação que realizar. A Plataforma não define jornada, não
          subordina, não fiscaliza a execução do trabalho e não interfere na relação entre as partes
          além de fornecer o meio de conexão.
        </p>
        <p>
          Nesta fase, a Sollo Business <strong>não processa pagamentos</strong> pelo serviço prestado
          entre Contratante e Profissional: o valor e a forma de pagamento são livremente combinados
          entre as partes, fora da Plataforma. A única cobrança feita pela própria Plataforma é o
          destaque pago de Anúncios, descrito na Seção 7.
        </p>

        <h2 id="conta">4. Cadastro e conta</h2>
        <p>
          Você é responsável por manter a confidencialidade de sua senha e por todas as atividades
          realizadas em sua conta. Avise-nos imediatamente pelo e-mail em contato@sollo.business em
          caso de uso não autorizado. Contas usadas para golpe, spam, discriminação, assédio ou
          anúncio de trabalho ilegal podem ser suspensas ou excluídas sem aviso prévio, sem prejuízo
          de outras medidas cabíveis.
        </p>
        <p>
          Para Contratantes, publicar um Anúncio exige, adicionalmente, e-mail confirmado, nome
          completo, CPF válido, telefone e endereço cadastrados — dados necessários para viabilizar,
          no futuro, a cobrança do destaque pago (Seção 7) e para reduzir fraude na Plataforma.
        </p>

        <h2 id="vagas">5. Publicação de vagas</h2>
        <p>
          Contratantes são exclusivamente responsáveis pela veracidade e legalidade do conteúdo dos
          Anúncios que publicam: título, descrição, local, data, categoria, cachê e demais condições.
          É proibido anunciar trabalho ilegal, discriminatório, ou em condições análogas à
          exploração. A Sollo Business não garante a realização, a qualidade ou o resultado do
          trabalho anunciado, tampouco atua como parte, fiadora, avalista ou garantidora de qualquer
          obrigação assumida entre Contratante e Profissional.
        </p>

        <h2 id="candidatura">6. Candidatura e seleção</h2>
        <p>
          Profissionais podem se candidatar livremente aos Anúncios visíveis dentro do seu raio de
          atuação declarado. A seleção do candidato é decisão exclusiva e discricionária do
          Contratante, que pode aceitar, recusar ou não responder a qualquer Candidatura, sem
          necessidade de justificativa, respeitada a legislação antidiscriminatória aplicável.
        </p>

        <h2 id="destaque">7. Destaque pago</h2>
        <p>
          O Contratante pode, opcionalmente, pagar <strong>R$ 7,90 (sete reais e noventa centavos)</strong>,
          em pagamento único via PIX processado pela instituição de pagamento{" "}
          <strong>Asaas</strong>, para que um Anúncio específico seja exibido com prioridade no topo
          do feed de Profissionais compatíveis, por um período de <strong>7 (sete) dias corridos</strong>{" "}
          contados da confirmação do pagamento. O destaque afeta apenas a ordem de exibição do
          Anúncio; não altera nenhuma outra condição da Vaga, não garante candidaturas, contratação
          ou qualquer resultado.
        </p>
        <p>
          O destaque, uma vez ativado e pago, <strong>não é reembolsável</strong>, inclusive em caso
          de cancelamento do Anúncio pelo Contratante antes do fim do período de 7 dias, ressalvadas
          as hipóteses de arrependimento previstas em lei para compras realizadas fora do
          estabelecimento comercial, quando aplicável.
        </p>
        <p>
          Esta funcionalidade de pagamento está sujeita à disponibilidade técnica da integração com
          o Asaas. Enquanto a integração não estiver ativa, a Plataforma pode exibir a oferta de
          destaque a título informativo, sem processar qualquer cobrança, sinalizando claramente que
          o recurso "estará disponível em breve".
        </p>

        <h2 id="avaliacoes">8. Avaliações</h2>
        <p>
          Depois de um trabalho combinado, Contratante e Profissional podem avaliar um ao outro,
          atribuindo nota e comentário. As avaliações devem refletir uma experiência real vivida na
          Plataforma, com boa-fé e sem intuito difamatório. Avaliações falsas, forjadas, abusivas ou
          que violem direitos de terceiros podem ser removidas, e a conta responsável, suspensa ou
          excluída.
        </p>

        <h2 id="propriedade">9. Conteúdo e propriedade intelectual</h2>
        <p>
          Você mantém a titularidade sobre o conteúdo que envia à Plataforma (fotos de perfil,
          portfólio, descrições de Anúncios, mensagens). Ao publicá-lo, você concede à Sollo Business
          uma licença não exclusiva, gratuita e mundial para hospedar, armazenar, exibir e
          reproduzir esse conteúdo estritamente para operar e divulgar as funcionalidades da
          Plataforma. Você declara possuir todos os direitos necessários sobre o conteúdo que envia e
          se responsabiliza por eventual violação de direitos de terceiros (incluindo direitos
          autorais e de imagem).
        </p>
        <p>
          A marca "Sollo Business", o logotipo e os demais elementos de identidade visual da
          Plataforma são de titularidade da Sollo Business e não podem ser usados sem autorização
          prévia por escrito.
        </p>

        <h2 id="condutas">10. Condutas proibidas</h2>
        <p>Ao usar a Plataforma, você concorda em não:</p>
        <ul>
          <li>Assediar, discriminar, ameaçar ou ofender outros Usuários;</li>
          <li>Publicar Anúncios ou candidaturas fraudulentas, enganosas ou para atividade ilegal;</li>
          <li>
            Tentar contornar as regras de segurança da Plataforma, incluindo suas políticas de acesso
            a dados (RLS) e limites técnicos;
          </li>
          <li>Coletar dados de outros Usuários para finalidade diversa do uso legítimo da Plataforma;</li>
          <li>Utilizar a Plataforma para qualquer atividade ilícita.</li>
        </ul>
        <p>
          Denúncias de violação podem ser feitas pelo e-mail{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2 id="responsabilidade">11. Limitação de responsabilidade</h2>
        <p>
          A Plataforma é fornecida "como está" e "conforme disponibilidade". Na máxima medida
          permitida pela legislação aplicável, a Sollo Business não se responsabiliza por: (i)
          condutas de Usuários dentro ou fora da Plataforma; (ii) a veracidade de informações
          inseridas por Usuários; (iii) o resultado, qualidade ou realização de qualquer trabalho
          combinado entre Contratante e Profissional; (iv) indisponibilidades temporárias decorrentes
          de manutenção, falha de provedores terceiros (incluindo Supabase, Resend, Apple, Google e
          Asaas) ou eventos fora de nosso controle razoável.
        </p>
        <p>
          Nada nestes Termos exclui responsabilidades que não possam ser legalmente excluídas ou
          limitadas, incluindo as previstas no Código de Defesa do Consumidor, quando aplicável à
          relação entre a Sollo Business e o Usuário no que se refere estritamente aos serviços
          prestados diretamente pela Plataforma (como o destaque pago).
        </p>

        <h2 id="indenizacao">12. Indenização</h2>
        <p>
          Você concorda em indenizar e isentar a Sollo Business de responsabilidade por quaisquer
          reclamações, danos ou prejuízos decorrentes do descumprimento destes Termos, do uso
          indevido da Plataforma ou da violação de direitos de terceiros por você praticada.
        </p>

        <h2 id="rescisao">13. Vigência, rescisão e exclusão de conta</h2>
        <p>
          Estes Termos vigoram enquanto durar sua relação com a Plataforma. Você pode excluir sua
          conta a qualquer momento, diretamente pelo aplicativo, em{" "}
          <strong>Perfil → Configurações → Excluir minha conta</strong>. A exclusão apaga
          permanentemente perfil, vagas, candidaturas, conversas e avaliações vinculadas à conta, e
          não pode ser desfeita.
        </p>
        <p>
          A Sollo Business pode suspender ou encerrar o acesso de qualquer Usuário que viole estes
          Termos, mediante aviso quando possível, sem prejuízo de outras medidas cabíveis.
        </p>

        <h2 id="alteracoes">14. Alterações destes termos</h2>
        <p>
          Podemos atualizar estes Termos conforme o produto evolui, em especial quando um fluxo de
          pagamento adicional for incorporado à Plataforma. Alterações relevantes serão avisadas
          dentro do aplicativo. O uso continuado da Plataforma após uma alteração implica aceitação
          dos novos Termos.
        </p>

        <h2 id="lei">15. Lei aplicável e foro</h2>
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo o Código
          Civil, o Marco Civil da Internet (Lei nº 12.965/2014) e, quando aplicável, o Código de
          Defesa do Consumidor (Lei nº 8.078/1990). Fica eleito o foro do domicílio do Usuário
          consumidor para dirimir eventuais controvérsias, quando aplicável por lei, ou o foro da
          comarca da sede da Sollo Business nos demais casos.
        </p>

        <h2 id="contato">16. Contato</h2>
        <p>
          Dúvidas sobre estes Termos: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </main>
  );
}
