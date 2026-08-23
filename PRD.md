# Sollo Business — PRD do MVP

**Versão:** 1.1 · **Data:** 22/08/2026 · **Status:** aprovado para execução
**Escopo desta versão:** app mobile (iOS + Android) **sem pagamento pelo serviço prestado** — a
única cobrança é o destaque opcional de vaga (§6.1)

---

## 1. Resumo

A Sollo Business conecta produções do entretenimento a profissionais freelancers pela variável que
o mercado mais ignora: **distância e tempo**. Quando um job cai de última hora, quem resolve é a
agenda de contatos de quem está produzindo — e quem não tem essa agenda perde o trabalho.

O MVP entrega o ciclo completo de contratação **até o aperto de mão**: publicar vaga, notificar quem
está perto e qualificado, receber candidatura, conversar e escolher. Pagamento fica de fora desta
versão e acontece fora da plataforma, combinado entre as partes.

**A aposta:** o valor não está em intermediar dinheiro, está em **encurtar o tempo entre "preciso de
alguém" e "achei alguém"**. Se isso funcionar, o pagamento vem depois como consequência natural.

---

## 2. O problema

No audiovisual, em eventos e na produção cultural, a escala é fechada com dias — às vezes horas — de
antecedência. Um técnico de som adoece na véspera. O segundo cinegrafista não confirma. A produção
descobre na sexta que o evento de sábado está com um buraco.

**Hoje isso se resolve por WhatsApp**, disparando em grupos e torcendo para alguém responder. O
resultado depende inteiramente do tamanho da rede pessoal de quem está produzindo.

Os dois lados perdem:

| Lado | Dor |
| --- | --- |
| **Contratante** | Rede pessoal limitada. Não sabe quem está disponível nem quem está por perto. Sem histórico ou reputação, contrata no escuro. |
| **Profissional** | Não fica sabendo de vagas a 4 km da sua casa. A renda depende de estar no grupo de WhatsApp certo. Quem entrou agora no mercado não tem rede nenhuma. |

**Duas janelas de urgência diferentes**, e o produto precisa servir as duas:

- **Urgente** — vaga para as próximas 72h. Vence quem responde primeiro. Notificação é obrigatória.
- **Programada** — vaga com semanas de antecedência. Vence quem tem o melhor portfólio. Busca e
  navegação importam mais que a notificação.

---

## 3. Personas

**Marina — produtora de eventos, 34 anos.** Toca de 3 a 8 eventos por mês. Monta equipe de 5 a 20
pessoas por job. Vive de planilha e WhatsApp. Precisa de gente **confiável**, e "confiável" para ela
significa alguém que já entregou antes ou que tenha prova de trabalho. Publica pelo celular, correndo,
entre uma montagem e outra.

**Diego — cinegrafista freelancer, 27 anos.** Renda variável entre R$ 1.500 e R$ 6.000/mês conforme a
agenda. Topa deslocamento de até 40 km. Quer preencher os buracos do calendário e não quer perder job
por não ter visto a mensagem. Portfólio espalhado entre Instagram e Drive.

---

## 4. Jornadas

### 4.1 Contratante — publicar e contratar

1. Cria conta, escolhe **Contratante**, preenche perfil da produtora.
2. **Publica a vaga**: título, descrição, categoria, foto de capa, endereço (autocomplete),
   data e hora do trabalho, se exige nota fiscal, cachê (ou "a combinar"), e se é **urgente**.
3. Ao publicar, vê **"N profissionais notificados na região"** — o sinal de que o alcance existe.
4. Recebe push a cada candidatura. Abre a lista, vê perfil, portfólio e avaliações de cada candidato.
5. Conversa pelo chat para alinhar detalhes.
6. **Seleciona** o candidato. Os demais são avisados automaticamente.
7. Depois da data, **avalia** quem trabalhou.

### 4.2 Profissional — ser encontrado e se candidatar

1. Cria conta, escolhe **Profissional**.
2. Monta o **perfil-vitrine**: foto, headline, bio, categorias, portfólio em grade.
3. Define **onde está** (GPS) e **até onde topa ir** (raio em km). Essa é a configuração que liga
   as notificações.
4. Navega o feed de vagas por proximidade, ou recebe push quando surge algo no raio.
5. **Um toque em "Tenho interesse"** — sem formulário, porque o perfil já é a candidatura.
6. Acompanha o status: aplicada → vista → selecionada/recusada.
7. Conversa pelo chat quando o contratante puxa o assunto.

---

## 5. Escopo do MVP

| # | Entrega | Por que está dentro |
| --- | --- | --- |
| 1 | Cadastro e login por e-mail/senha, com escolha de tipo de conta | Base de tudo |
| 2 | Perfil profissional com portfólio em grade | É a candidatura. Sem isso o contratante escolhe no escuro |
| 3 | Perfil de contratante | Profissional precisa saber para quem vai trabalhar |
| 4 | Publicação e gestão de vaga (criar, editar, cancelar) | Metade do marketplace |
| 5 | Feed com filtro por raio, categoria, data e urgência | A outra metade |
| 6 | Candidatura em um toque e acompanhamento de status | O momento que o produto existe para servir |
| 7 | Lista de candidatos, seleção e recusa | Fecha o ciclo do contratante |
| 8 | Chat 1:1 por candidatura | Alinhamento de detalhe é onde o job fecha ou morre |
| 9 | **Notificação push + e-mail por raio** | O diferencial. Sem isso somos um classificado passivo |
| 10 | Central de notificações e preferências | Contrapeso obrigatório do item 9 |
| 11 | Avaliação do profissional após o job | Semente da reputação, que é o ativo de longo prazo |

## 6. Fora de escopo — e por quê

| Não entra | Motivo |
| --- | --- |
| Pagamento pelo serviço prestado (escrow, comissão, reembolso) | Muda o produto de "encontro" para "financeiro": exige antifraude, contas de pagamento, tributação e suporte. Adia o lançamento em meses. Sem tráfego, não há o que intermediar. |
| Orçamentos com itens e margem | Só faz sentido acoplado a pagamento |
| Drive de arquivos, gestão de projetos e equipes | Ferramenta de operação, não de descoberta. Não resolve a dor central |
| Painel web do contratante | Publicação acontece no celular, correndo. Web é conforto, não necessidade |
| Verificação de identidade e contrato digital | Reputação por avaliação cobre o MVP |
| Emissão de nota fiscal | Fica só o campo "exige nota" para filtro |
| Taxonomia de 200+ serviços | Começar com ~20 categorias. Taxonomia grande com base pequena fragmenta o feed e mata a liquidez |

### 6.1 A única exceção: destaque pago

O MVP não intermedia o pagamento **pelo serviço prestado** (item acima), mas cobra por um recurso
de visibilidade: o contratante pode pagar **R$ 7,90, via PIX (Asaas), pagamento único**, para que
a vaga fique no topo do feed por **7 dias**. Não é escrow nem comissão — é uma cobrança direta pela
plataforma, sem envolver o pagamento do profissional. Na versão inicial do app, o botão de destacar
mostra a oferta mas ainda não processa pagamento de verdade (Asaas não integrado): aparece um aviso
de "em breve" até a integração entrar.

---

## 7. Requisitos funcionais por tela

### Autenticação
- Splash, boas-vindas, escolha de tipo de conta, cadastro, login, recuperação de senha — **já construídos**, hoje sobre stub.
- Sessão persistida com segurança (Keychain/Keystore).
- **Exclusão de conta dentro do app** — exigência da App Store para apps com cadastro.

### Perfil profissional
- Foto, headline, bio, categorias (múltiplas), links externos.
- Portfólio em grade, com upload da galeria ou câmera, legenda e reordenação.
- Localização base e raio de atuação (padrão 30 km).
- Toggle **disponível para vagas** — quem está fora não recebe push.
- Avaliação média e histórico de trabalhos.

### Perfil de contratante
- Nome da produtora, sobre, logo, site, avaliação média.
- Vagas publicadas (histórico público — é o que dá lastro).

### Publicar vaga
- Título, descrição, categoria, foto de capa.
- Endereço com autocomplete → coordenada gravada.
- Data e hora de início, duração estimada.
- Cachê com valor ou "a combinar"; toggle **exige nota fiscal**; número de vagas.
- Toggle **urgente**, com aviso claro de que dispara notificação para a região.
- Rascunho e publicação.

### Feed de vagas
- Ordenação: urgentes primeiro, depois proximidade, depois data mais próxima.
- Filtros: raio, categoria, período, só urgentes, só com cachê definido.
- Card mostra distância em km, data, cachê e selo de urgente.
- Estado vazio que explica **como aumentar o raio** — crítico enquanto a base é pequena.

### Detalhe da vaga e candidatura
- Todos os dados, mapa estático do local, perfil do contratante.
- **"Tenho interesse"** em um toque, com mensagem opcional.
- Estado da candidatura e opção de retirar.

### Candidatos (contratante)
- Lista com foto, headline, distância, avaliação e portfólio.
- Marcar como vista, abrir chat, **selecionar** ou recusar.
- Ao selecionar: a vaga muda para "preenchida" e os demais são avisados.

### Chat
- 1:1 amarrado à vaga, criado na candidatura. Só texto no MVP.
- Indicador de lido e push de mensagem nova.

### Notificações
- Inbox no app com histórico e navegação direta ao item.
- Preferências: push e e-mail por tipo de evento, raio, categorias, **horário de silêncio**.

---

## 8. Motor de vagas urgentes

O coração do produto. Regras concretas:

**O que é urgente:** vaga com início em até **72 horas**, ou marcada manualmente pelo contratante.

**Quem é notificado:** profissionais em que **todas** as condições valem —
1. a vaga está dentro do **raio declarado pelo profissional** (o raio é dele, "até onde eu topo ir", não do contratante);
2. a categoria da vaga está entre as dele;
3. está marcado como disponível;
4. as preferências de notificação permitem.

**Canais:** push sempre; **e-mail também quando urgente**, porque push perdido é vaga perdida.

**Atrito zero para responder:** o push abre direto no detalhe da vaga por deep link, e o botão de
candidatura é único e imediato — o perfil já foi montado antes, então não existe formulário entre a
notificação e a candidatura. **Esse encurtamento é o produto.**

**Metas de tempo:**

| Métrica | Alvo |
| --- | --- |
| Push entregue após publicação | < 60 segundos |
| Primeira candidatura em vaga urgente | < 15 minutos |
| Vaga urgente preenchida | < 6 horas |

**Anti-spam** (sem isso o app é desinstalado em duas semanas):
- Teto de **5 notificações de vaga por dia** por profissional.
- Horário de silêncio configurável, padrão 22h–7h, com opção explícita de "aceito urgente a qualquer hora".
- Mute por categoria.
- Trava de duplicidade: a mesma vaga nunca notifica a mesma pessoa duas vezes.

**Decisão consciente para o MVP:** notificar todo mundo do raio de uma vez. Com base pequena isso é
o certo. Quando uma vaga passar a receber dezenas de candidaturas, migrar para **notificação em ondas**
(melhores avaliados primeiro, ampliando se ninguém responder).

---

## 9. Matriz de notificações A → B

Toda notificação nasce de um evento único e padronizado, nunca de disparo espalhado pelo código.

| Evento | De → Para | Push | E-mail | Abre em |
| --- | --- | :---: | :---: | --- |
| `job.published.nearby` | sistema → profissionais no raio | ✅ | só se urgente | detalhe da vaga |
| `application.received` | profissional → contratante | ✅ | ✅ | lista de candidatos |
| `application.selected` | contratante → profissional | ✅ | ✅ | detalhe da vaga |
| `application.rejected` | contratante → profissional | ✅ | — | minhas candidaturas |
| `message.received` | A → B | ✅ | — | conversa |
| `job.cancelled` | contratante → candidatos | ✅ | ✅ | minhas candidaturas |
| `job.reminder` (D-1) | sistema → selecionado e contratante | ✅ | — | detalhe da vaga |
| `rating.received` | contratante → profissional | ✅ | — | meu perfil |

Todo evento também vira item no inbox do app, independente do canal externo.

---

## 10. Métricas de sucesso

**North star:** número de **vagas urgentes preenchidas em até 24h por semana**. É a métrica que só
sobe se os dois lados estiverem funcionando ao mesmo tempo.

| Métrica | Meta inicial |
| --- | --- |
| Tempo até a 1ª candidatura (vaga urgente) | < 15 min |
| Candidaturas por vaga | ≥ 4 |
| Vagas preenchidas | ≥ 60% |
| Taxa de abertura de push de vaga | ≥ 25% |
| Profissionais ativos por região (raio de 30 km) | ≥ 50 antes de abrir para contratantes |
| Desativação de notificação | < 10% |

---

## 11. Riscos

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| **Liquidez / cold start** | Fatal. Vaga publicada sem ninguém no raio queima o contratante logo na primeira tentativa | Abrir **uma cidade por vez**. Recrutar ≥ 50 profissionais por região **antes** de liberar publicação. Não abrir cadastro de contratante onde não há base |
| **Fadiga de notificação** | Alto. Push demais = desinstalação, e sem base o motor morre | Teto diário, horário de silêncio, mute por categoria |
| **No-show** sem pagamento retido | Alto. Nada obriga o profissional a aparecer | Avaliação visível e histórico. Marcar no-show explicitamente. Escrow resolve de vez na v2 |
| **Negociação sai da plataforma** | Médio agora, alto quando houver comissão | Aceito no MVP — sem pagamento não há o que proteger. Chat interno mantém o registro |
| **LGPD / geolocalização** | Alto. Localização é dado pessoal | Guardar **ponto aproximado (bairro)**, nunca o exato. Consentimento explícito no onboarding. Exclusão de conta apaga tudo |
| **Qualidade do cadastro inicial** | Médio | Perfil incompleto não recebe push nem aparece bem no feed |

---

## 12. Roadmap pós-MVP

**v1.1** — Notificação em ondas, filtros salvos com alerta, anexos no chat, convite direto a profissional.

**v2 — Pagamentos.** PIX com retenção, liberação após confirmação de entrega, comissão de 5%,
garantia de reembolso. **É aqui que a landing atual volta a ser verdade por inteiro.**

**v3** — Orçamentos com itens e margem, painel web do contratante, times e projetos, verificação de
identidade, drive de arquivos.

---

## 13. Referências

- Execução técnica, modelo de dados e fases: `~/.claude/plans/agora-que-temos-a-dapper-acorn.md`
- Copy original da landing: `/Users/andrade/Documents/SOLLO/copy-landing-page-sollo.md`
- Identidade visual: `SOLLO Branding.pdf`
- Landing em produção: raiz do repositório · App: `mobile/`
