import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Termos de uso: ${site.name}`,
  description: "Termos de uso da Sollo Business."
};

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
          Estes termos regulam o uso da Sollo Business, uma plataforma que conecta profissionais e
          contratantes do mercado do entretenimento. Ao criar uma conta, você concorda com o que
          está descrito aqui.
        </p>

        <h2>1. O que a Sollo Business é hoje</h2>
        <p>
          Nesta fase, a Sollo Business é um app de descoberta e contato: publicação de vagas,
          candidatura, chat entre as partes e avaliação mútua ao fim do trabalho. A plataforma{" "}
          <strong>não processa pagamentos</strong>: valores e forma de pagamento pelo serviço são
          combinados diretamente entre contratante e profissional, fora do app.
        </p>

        <h2>2. Cadastro e conta</h2>
        <p>
          Você é responsável pela veracidade das informações do seu perfil e pela guarda da sua
          senha. Contas usadas para golpe, spam ou anúncio de trabalho ilegal são removidas sem
          aviso prévio.
        </p>

        <h2>3. Publicação de vagas</h2>
        <p>
          Contratantes são responsáveis pelo conteúdo e pela veracidade das vagas publicadas:
          local, data, valor combinado e demais condições. A Sollo Business não garante a
          realização do trabalho nem atua como parte na relação entre contratante e profissional.
        </p>

        <h2>4. Candidatura e seleção</h2>
        <p>
          Profissionais se candidatam livremente às vagas visíveis no seu raio de atuação. A
          seleção do candidato é decisão exclusiva do contratante.
        </p>

        <h2>5. Avaliações</h2>
        <p>
          Depois de um trabalho combinado, contratante e profissional podem avaliar um ao outro.
          Avaliações precisam refletir uma experiência real vivida na plataforma; avaliações falsas
          ou abusivas podem ser removidas e a conta responsável, suspensa.
        </p>

        <h2>6. Conduta proibida</h2>
        <p>
          Não é permitido usar a plataforma para assédio, discriminação, fraude, cobrança
          enganosa ou qualquer atividade ilegal. Denúncias podem ser feitas pelo{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <h2>7. Exclusão de conta</h2>
        <p>
          Você pode excluir sua conta a qualquer momento pelo app, em Perfil → Configurações →
          Excluir minha conta. A exclusão apaga permanentemente perfil, vagas, candidaturas,
          conversas e avaliações vinculadas à conta.
        </p>

        <h2>8. Mudanças nestes termos</h2>
        <p>
          Podemos atualizar estes termos conforme o produto evolui, em especial quando um fluxo
          de pagamento for adicionado à plataforma. Mudanças relevantes serão avisadas no app.
        </p>

        <h2>9. Contato</h2>
        <p>
          Dúvidas sobre estes termos: <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
    </main>
  );
}
