# Sollo Business — app mobile

App em **React Native + Expo (SDK 57)** com **Expo Router**, TypeScript e **Reanimated**.
Mesma identidade da landing page: Montserrat, magenta `#D81368`, lime `#CEFE2A` e fundo preto.

## Rodar

```bash
cd mobile
npm install
npm run ios
```

`npm run android` e `npm run web` também funcionam. Na primeira execução, o Expo instala o
Expo Go no simulador.

## Estrutura

```
app/                        rotas (expo-router, file-based)
  _layout.tsx               fontes, sessão, safe area, stack raiz
  index.tsx                 SPLASH — animação da marca + decide o destino
  (auth)/
    _layout.tsx
    welcome.tsx             porta de entrada: criar conta ou entrar
    tipo-de-conta.tsx       profissional × contratante (passo 1 de 2)
    cadastro.tsx            nome, e-mail, senha e termos (passo 2 de 2)
    login.tsx               e-mail e senha
    recuperar-senha.tsx     pede o link de redefinição
    redefinir-senha.tsx     recebe o deep link e define a nova senha
    confirmar-email.tsx     aguarda confirmação após o cadastro
  (app)/
    _layout.tsx             guarda de rota: sem sessão, volta para auth
    (tabs)/
      _layout.tsx           Tabs do expo-router, tab bar própria (ver TabBar.tsx)
      home.tsx              Início: dashboard por tipo de conta
      vagas.tsx              feed (profissional) ou minhas vagas (contratante) — mesma rota
      conversas.tsx          lista de conversas
      perfil.tsx              vitrine: avatar, métricas, categorias, portfólio
    perfil/completar-cadastro.tsx  nome, CPF, telefone, endereço — trava antes de publicar
    perfil/editar.tsx       edição + upload de avatar e portfólio
    perfil/localizacao.tsx  base por GPS e raio de atuação
    perfil/configuracoes.tsx  sair, preferências, excluir conta
    vaga/nova.tsx           publicar vaga (+ destacar, opcional)
    vaga/[id]/index.tsx     detalhe, alcance, candidatura, cancelamento, destacar
    vaga/[id]/candidatos.tsx  lista, seleção e recusa (contratante)
    candidaturas.tsx        minhas candidaturas (profissional)
    perfil/[id].tsx         perfil público de outra pessoa
    notificacoes/index.tsx  inbox (alcançada pelo sininho no header das abas)
    notificacoes/preferencias.tsx  canais, teto diário, silêncio
    conversa/[id].tsx       chat 1:1 (realtime)
    avaliacoes/index.tsx    avaliações pendentes
    avaliacoes/[jobId]/[ratedId].tsx  formulário de avaliação
src/
  theme/tokens.ts           cores, espaçamento, raios, tipografia
  theme/logo.ts              paths SVG do logotipo (os mesmos da web)
  components/               Logo, Button, Input, Screen, Avatar, Chip,
                            EnderecoInput, DataHoraInput, VagaCard, TabBar, TabIcons,
                            NotificationBell, PinInput, DestacarVagaModal
  screens/                  telas grandes reaproveitadas por rota (FeedProfissional,
                            MinhasVagasContratante — ver vagas.tsx)
  api/profile.ts            queries e mutações de perfil (com retry)
  api/jobs.ts               criar, publicar, cancelar e listar vagas
  api/feed.ts               feed por raio (RPC jobs_feed_para_mim)
  api/applications.ts       candidatar, retirar, selecionar, recusar
  api/notifications.ts      inbox e preferências
  lib/cpf.ts                 formata e valida CPF (dígito verificador)
  lib/notifications.ts      registro de token Expo e deep link
  lib/media.ts              escolher e enviar imagem para o Storage
  lib/retry.ts              retentativa para falha transitória de rede
  lib/supabase.ts           cliente Supabase + storage seguro fatiado
  lib/auth.ts               autenticação (Supabase Auth), erros em português
  lib/session.tsx           sessão + perfil, via onAuthStateChange
  types/database.ts         tipos gerados do schema (supabase gen types)
assets/                     ícone, adaptive icon, splash (gerados do manual)
```

## Fluxo de navegação

```
index (splash)
   ├── sessão salva ──────────────► (app)/home
   └── sem sessão ────────────────► (auth)/welcome
                                        ├── tipo-de-conta ──► cadastro ──► (app)/home
                                        └── login ──────────► (app)/home
                                              └── recuperar-senha
```

A sessão fica em `expo-secure-store` (Keychain no iOS, Keystore no Android; `localStorage`
na web). `(app)/_layout.tsx` redireciona para o fluxo de auth se não houver sessão.

## Autenticação — Supabase Auth (real)

`src/lib/supabase.ts` cria o cliente; `src/lib/auth.ts` expõe `signIn`, `signUp`,
`requestPasswordReset` e `signOut`, traduzindo os erros do provedor para português e
atribuindo cada um ao campo responsável — é isso que faz a UI destacar o input certo.

O token vive no **Keychain/Keystore** via `expo-secure-store`. Como o SecureStore tem limite de
~2 KB por valor no Android e o JWT do Supabase passa disso, o adapter **fatia o valor em pedaços**
e remonta na leitura. O refresh automático só roda com o app em primeiro plano.

`src/lib/session.tsx` escuta `onAuthStateChange` e resolve a linha de `profiles` do usuário —
as telas consomem `{ session, profile, loading }`.

Cadeia disparada pelo cadastro, tudo em uma transação no banco:

```
supabase.auth.signUp({ options: { data: { nome, tipo } } })
   └─► trigger handle_new_user
          ├─► profiles
          ├─► professional_profiles  ou  hirer_profiles
          └─► trigger on_profile_created_prefs ─► notification_prefs
```

### Confirmação de e-mail está LIGADA

`signUp` devolve `precisaConfirmarEmail: true` quando não há sessão, e o app leva para
`(auth)/confirmar-email`. ⚠️ O SMTP embutido do Supabase serve só para teste — poucos e-mails
por hora. **Antes de abrir cadastro público, apontar o Auth para o Resend** (Fase 6), senão o
onboarding trava.

### Variáveis de ambiente

`mobile/.env` (fora do git) com a URL e a chave **publishable** do projeto — protegidas por RLS.
A chave secreta nunca entra no app: vive só nas Edge Functions. Modelo em `.env.example`.

## Design system

Os tokens em `src/theme/tokens.ts` espelham as variáveis CSS da web. Componentes prontos:

- **`Button`** — pílula da marca em três variantes (`magenta`, `lime`, `ghost`), com resposta
  de escala no toque e estado de loading.
- **`Input`** — label em caixa alta, foco magenta, erro por campo e botão mostrar/ocultar senha.
- **`Screen`** — casca padrão: safe area, `KeyboardAvoidingView`, scroll e botão voltar.
- **`Wordmark` / `IconMark`** — logotipo em SVG, os mesmos paths da web.

O app é **preto puro, sem elementos decorativos de fundo** — as esferas em degradê ficam só na
landing page. Aqui o peso visual vem da tipografia, do espaçamento e do magenta usado apenas em
elementos interativos e acentos.

Animações usam **Reanimated** (o GSAP não roda em React Native): `withTiming` na splash e
`FadeInDown` nas entradas de tela.

## Bug corrigido: elemento fantasma no topo da tela

Logo após o login, o último botão da Home ("Meu perfil" ou "Sair da conta") aparecia
**duplicado e cortado, colado na status bar**, sobrepondo o topo real da tela. Reproduzível
de forma determinística mesmo com reinstalação completa do app — não era cache, HMR, nem
acúmulo de navegação.

**Causa:** `Screen.tsx` aplicava `insets.top` do hook `useSafeAreaInsets()` como padding
manual via JS. Na primeira renderização esse hook pode valer `0` antes do valor real chegar
do nativo; se esse primeiro frame (conteúdo colado no topo físico) chega a ser pintado pelo
Fabric antes do re-render com o inset correto, ele fica gravado por trás do layout final —
o efeito visual é exatamente um elemento "fantasma" cortado no topo.

**Correção:** trocar o padding manual pelo componente `<SafeAreaView>` (mesmo pacote,
`react-native-safe-area-context`), que resolve o inset **nativamente antes da primeira
pintura** — o frame incorreto nunca chega a existir. Validado com reinstalação completa e
screenshot via `simctl` (fora do app), não só pela ferramenta de automação.

## Bug corrigido: botão voltar não respondia ao toque

Ao corrigir o elemento fantasma acima, o botão voltar do `Screen.tsx` — `position: "absolute"`,
irmão do `KeyboardAvoidingView` (`flex: 1`) — parou de receber toques, mesmo desenhado por cima
visualmente. Adicionar `zIndex`/`elevation` não resolveu.

**Causa:** no React Native, a árvore de **hit-testing** (quem recebe o toque) é separada da
ordem de **pintura** (quem aparece por cima). Um `flex: 1` que ocupa o espaço todo intercepta o
toque mesmo estando visualmente atrás de um `absolute` — `zIndex` só afeta pintura, não roteamento
de toque entre irmãos. Diagnosticado por comparação: o botão voltar da tela de chat (no fluxo
normal do documento) funcionava; o do `Screen.tsx` (absoluto), não.

**Correção:** tirar o botão da posição absoluta e colocá-lo **no fluxo normal**, como uma `View`
de cabeçalho (`barraVoltar`) antes do `KeyboardAvoidingView` na árvore, em vez de sobreposto a ele.

## Perfil e localização

O perfil profissional é a candidatura: é o que o contratante vê antes de escolher. O anel do
avatar fica **lime quando a pessoa está disponível** para vagas — o estado que o mercado precisa
enxergar primeiro.

`perfil/localizacao.tsx` é a tela que **liga o motor de notificação**. Sem `base_point` e
`raio_km`, o profissional não entra em nenhum fanout. O raio é dele ("até onde eu topo ir"),
não da vaga.

### Precisão reduzida por padrão

A RPC `set_professional_location` **arredonda a coordenada para 2 casas decimais** antes de
gravar (~1 km de deslocamento). Verificado na prática: GPS em `-22.9838, -43.2096` virou
`-22.98, -43.21` no banco. A busca por raio não perde nada e o endereço residencial não fica
exposto.

### Rede instável

`lib/retry.ts` reexecuta mutações que falham por erro transitório de rede — o iOS derruba
conexões keep-alive e o fetch estoura "network connection was lost". Sem isso, uma oscilação
apaga o que a pessoa acabou de digitar.

## Vagas

### Endereço sem chave de API

`EnderecoInput` usa o **geocoder nativo** do iOS/Android via `expo-location` — gratuito e sem
chave. O contratante digita o endereço, toca em BUSCAR e a coordenada é resolvida; ou usa o GPS.
Não há dropdown de autocomplete, mas o que o motor de raio precisa é o ponto, e ele vem.
Trocar por Google Places depois é substituir só esse componente.

Diferente da base do profissional, a coordenada da vaga **não é arredondada**: é endereço de
trabalho, e o candidato precisa saber exatamente onde é.

### A vaga nasce rascunho

`criarVaga` insere como `rascunho`, grava o local por RPC e só então publica. Publicar antes
dispararia o fanout sem coordenada — notificando ninguém, ou gente errada.

### Urgência é inferida, não só marcada

Vaga que começa em até **72h** entra como urgente automaticamente (trigger `jobs_infer_urgency`),
mesmo sem o contratante marcar. O formulário mostra isso em tempo real conforme a data muda, e
esconde o switch manual quando o prazo já decidiu.

Ao publicar, o app chama `candidates_for_job` e informa **quantos profissionais serão avisados** —
é o sinal de que o alcance existe, e o que impede o contratante de publicar no vazio sem saber.

## Feed

`jobs_feed_para_mim` resolve a coordenada **pelo `auth.uid()` dentro do banco** — o app não
carrega a localização do usuário só para consultar o feed. Menos dado pessoal trafegando e
menos chance de erro.

Ordenação: **urgente primeiro, depois proximidade, depois data**. Distância aparece antes de
tudo no card porque é o que decide se vale a pena.

Sem filtro explícito, o feed usa o **raio e as categorias do próprio perfil** — o mesmo critério
das notificações. O que aparece no feed é o que teria chegado por push.

### Vazio que explica

Se não há resultado, `jobs_count_no_raio(100)` diz quantas vagas existem num raio maior, e o app
oferece ampliar. Estado vazio mudo faz a pessoa achar que o app quebrou — com base pequena,
isso mata a retenção logo no primeiro uso.

## Candidatura e seleção

**Um toque, sem formulário.** O perfil já é a candidatura — esse atrito zero entre a notificação
e o "tenho interesse" é o produto. Em vaga urgente, cada campo a mais custa candidato.

Abrir a lista de candidatos marca automaticamente as candidaturas como **visualizadas**: quem se
candidatou vê que alguém olhou, em vez de ficar no silêncio.

Escolher um candidato dispara **uma transação no banco** (trigger `applications_on_select`):

```
status = 'selecionada'
   ├─► demais candidaturas  → 'recusada'
   ├─► vaga                 → 'preenchida' + closed_at
   └─► outbox               → application.selected / application.rejected
```

### Armadilha de RLS: recursão entre políticas

A policy de SELECT em `jobs` consultava `applications`, e a de INSERT em `applications`
consultava `jobs` — o Postgres detectava **"infinite recursion detected in policy"** na hora de
candidatar. A correção foi mover as consultas cruzadas para funções `SECURITY DEFINER`
(`me_candidatei`, `vaga_aceita_candidatura`, `fui_selecionado`), que rodam fora da RLS e não
reentram na policy da outra tabela — mesmo padrão de `is_job_owner`.

Vale a regra geral: **policy que consulta outra tabela protegida por RLS sempre passa por função
definer.** O lint não pega isso; só aparece na primeira query real.

## Notificações

Ponto único de saída. Nada no app nem no banco envia notificação por fora daqui:

```
trigger no banco → notification_events (outbox)
        → trigger disparar_notificacao (pg_net, assíncrono)
              → Edge Function dispatch-notification
                    ├─ resolve destinatários (explícitos ou por raio)
                    ├─ aplica preferências e horário de silêncio
                    ├─ grava o inbox
                    ├─ push  → Expo Push API (lotes de 100)
                    └─ e-mail → Resend (só nos eventos que justificam)
```

Medido na prática: **publicar vaga → notificação no inbox em ~2 segundos**.

O `pg_net` é assíncrono de propósito — publicar uma vaga não pode ficar esperando push sair.

### Segredos

A URL e o segredo do dispatch vivem no **Vault** do Postgres, lidos pelo trigger em tempo de
execução. A migration pode ir para o repositório sem carregar credencial. Sem segredo
configurado, o evento **fica na fila** em vez de sumir — e `reprocessar_notificacoes_pendentes()`
reempurra o que ficou para trás.

### Horário de silêncio

Calculado no fuso **America/Sao_Paulo**, não no do servidor (que roda em UTC). Só vaga urgente
fura o silêncio, e só para quem ligou `urgente_ignora_silencio`.

### ⚠️ Push exige development build

O Expo Go não recebe push remoto desde o SDK 53. `registrarParaPush` detecta isso e a tela de
preferências **diz o motivo** em vez de fingir que registrou. Para testar push de verdade:
`eas build --profile development`.

### ⚠️ E-mail precisa de chave

Sem `RESEND_API_KEY` nos secrets da função, o e-mail é pulado com aviso no log — o push continua
saindo normalmente. Configurar com:

```bash
supabase secrets set RESEND_API_KEY=re_xxx EMAIL_FROM="Sollo Business <avisos@seudominio.com>"
```

## Avaliações

Sistema bilateral: contratante avalia o profissional selecionado, e o profissional selecionado
avalia o contratante — mesma tabela `ratings`, com `unique(job_id, rater_id, rated_id)` para
impedir avaliação duplicada e RLS de INSERT liberado a quem for `is_job_owner` **ou**
`fui_selecionado(job_id)` (a função definer da seção de RLS acima).

`avaliacoes_pendentes()` faz um `union all` das duas direções — vagas `preenchida` com
`starts_at` no passado, filtrando o que a pessoa já avaliou via `not exists`. `avaliacoes_recebidas`
alimenta o perfil público. O `rating_avg`/`rating_count` já eram denormalizados pelo trigger
`ratings_recompute` de uma fase anterior; a tela só precisou passar a alimentá-los.

`avaliacoes/index.tsx` lista as pendências; `avaliacoes/[jobId]/[ratedId].tsx` é o formulário
(`StarRating` de 1 a 5, rótulo textual por nota, comentário opcional). Ao enviar, a lista
recarrega (`useFocusEffect`) e a pendência some sozinha — o filtro `not exists` da RPC já exclui
o que acabou de ser avaliado, sem precisar de estado local espelhando o banco.

## Segurança do banco

`supabase db advisors --linked` apontou **28 funções `SECURITY DEFINER` chamáveis pelo `anon`** —
incluindo `emit_notification_event` (fabricar notificação para qualquer usuário). Toda função em
`public` fica exposta em `/rest/v1/rpc` por padrão.

A correção (`20260821220000_lockdown_functions.sql`): **REVOKE de PUBLIC em tudo, GRANT explícito
só no que o app chama**. `revoke from anon, authenticated` não basta — o privilégio vem de
PUBLIC, que os dois herdam.

Resultado: exposição ao `anon` de 28 → **0**. As 11 que restam para `authenticated` são a API real
do app, e cada uma confere `auth.uid()` internamente.

Duas correções vieram junto: `set_job_location` tinha `or auth.uid() is null` (resquício do seed)
que deixava qualquer um mover qualquer vaga; e o app trocou `candidates_for_job` por
`job_reach_count`, que devolve só o número e confere se quem pergunta é o dono — a versão antiga
entregava a lista de ids dos profissionais da região.

Pendente no painel: ativar **leaked password protection** (checagem HaveIBeenPwned), que o
advisor sinaliza como desligada.

## Ícones e splash

`assets/icon.png`, `adaptive-icon.png`, `splash-icon.png` e `favicon.png` foram gerados a
partir dos PNGs do manual, recortados pela caixa da tinta e centralizados. Para regerar com
outra arte, substitua os arquivos mantendo os nomes.

Há duas splashes: a **nativa** (`expo-splash-screen`, configurada em `app.json`, some quando as
fontes carregam) e a **animada** (`app/index.tsx`), que roda em seguida por ~1,5s.

## Exclusão de conta

Exigência da App Store (5.1.1(v)) para qualquer app com criação de conta: quem cria a conta pelo
app também precisa poder apagá-la pelo app, sem precisar escrever e-mail pedindo.

`Perfil → Configurações → Excluir minha conta` chama a RPC `delete_own_account()`
(`security definer`, dono `postgres`), que apaga a linha em `auth.users`. Como `profiles`
referencia `auth.users(id) on delete cascade`, essa única exclusão derruba em cascata perfil,
vagas, candidaturas, mensagens, avaliações, tokens de push e preferências — sem precisar listar
cada tabela a mão. Verificado com uma conta descartável: RPC retorna 204, o perfil some do banco
e o usuário em `auth.users` passa a devolver 404.

## Termos de uso e política de privacidade

Publicados como páginas estáticas da landing (`app/termos/page.tsx`, `app/privacidade/page.tsx`,
raiz do repo) — `www.sollo.business/termos` e `www.sollo.business/privacidade`. Os links em
`(auth)/welcome.tsx` e `(auth)/cadastro.tsx`, que antes apontavam para a própria tela, agora
abrem essas URLs via `Linking.openURL`.

## Landing: copy sem promessa de pagamento

O MVP não processa pagamento — fica combinado direto entre contratante e profissional. A copy da
landing (`content/site.ts`, `components/sections/Pricing.tsx`, metadata em `app/layout.tsx`)
citava PIX, comissão de 5% e garantia de reembolso; foi ajustada para não prometer o que o produto
ainda não faz, e a Etapa 4 do "como funciona" passou a descrever a avaliação em duas vias — que é
real — no lugar da liberação de pagamento.

Achado ao verificar o build depois desse ajuste: `next build` **já estava quebrado antes desta
fase**, porque o `tsconfig.json` da raiz não excluía `supabase/`, e o typecheck do Next varria o
Deno da Edge Function junto. Corrigido adicionando `"supabase"` ao `exclude`.

## EAS — build e submissão

`mobile/eas.json` criado com os três perfis padrão (`development`, `preview`, `production`) e
`expo-notifications` adicionado aos `plugins` do `app.json` (ícone e cor da notificação no
Android). O que fica fora do alcance de automação, por exigir login e credenciais que só o dono
da conta tem:

1. `eas login` e `eas init` (gera o `projectId` em `extra.eas`).
2. Conta Apple Developer paga (US$ 99/ano) — pré-requisito para push em iOS e TestFlight.
3. Credenciais **FCM** (service account JSON, Android) e **APNs** (key, iOS) — `eas credentials`.
4. `eas build --profile development` para instalar no simulador/aparelho de teste — push só
   funciona em dev build, não no Expo Go.
5. `eas submit` para TestFlight e para o teste interno da Play.
6. Ficha da loja: descrição, screenshots, categoria, classificação indicativa, política de
   privacidade (usar a URL acima nos dois consoles).

## Navegação: tab bar, sininho, casca do app

O app não tinha estrutura de navegação de verdade: `home.tsx` era uma lista vertical de botões, e
duas telas (`feed.tsx`, `notificacoes/index.tsx`) eram becos sem saída — sem botão voltar, sem
gesto, dependendo só do fato de estarem uma raiz de navegação.

Virou uma casca de `Tabs` do expo-router com 4 abas (`mobile/app/(app)/(tabs)/`): **Início**
(dashboard por tipo de conta), **Vagas** (feed do profissional ou "minhas vagas" do contratante,
mesma rota `/vagas` decidindo o conteúdo em runtime por `profile.tipo` — não dá pra declarar dois
`Tabs.Screen` condicionais no expo-router, então a decisão fica dentro do componente), **Conversas**
e **Perfil**. Tab bar própria (`src/components/TabBar.tsx` + `src/components/TabIcons.tsx`, SVGs de
traço único no mesmo estilo do `IconMark`) — não usa o visual nativo do react-navigation, nem
`@expo/vector-icons` (o projeto nunca teve lib de ícone; não valia introduzir uma só pra 5 glifos).

`Screen.tsx` ganhou uma prop `right` — mesma fileira que já existia pro botão voltar, agora também
aceita uma ação à direita. É onde `NotificationBell.tsx` entra nas 4 telas raiz de aba, com contador
de não lidas (reaproveita `contarNaoLidas()`, que já existia em `api/notifications.ts`, recarregado
por `useFocusEffect` — sem realtime nesta fase). Tocar no sininho empurra pra `/notificacoes`, que
deixou de ser uma tela sem saída: ganhou botão voltar de verdade.

`feed.tsx` e `notificacoes/index.tsx` tinham o mesmo padrão de cabeçalho manual com
`useSafeAreaInsets()` que já causou o bug do "elemento fantasma" (ver seção acima) — corrigido de
brinde para `SafeAreaView`, preventivamente, já que essas telas nunca tinham sido revisitadas desde
aquele fix.

### Achado de passagem

`(auth)/tipo-de-conta.tsx` ainda prometia "5% de comissão" e "pagamento garantido pela plataforma"
pro contratante — sobra da copy anterior à Fase 9. Corrigido junto (agora reflete o destaque pago
opcional, ver seção abaixo).

## Destaque pago (R$ 7,90 / 7 dias)

Única cobrança do MVP: o contratante paga uma vez, via PIX (Asaas), para a vaga ficar no topo do
feed por 7 dias. O Asaas **não está integrado ainda** — o botão existe (na publicação e na vaga já
publicada), mas abre `DestacarVagaModal.tsx`, que só mostra a oferta e avisa "em breve". Nenhuma
chamada de API de pagamento, nenhuma gravação no banco.

O terreno já está preparado pro dia em que a integração existir: `jobs.destacada_ate timestamptz`
(migration `20260822020000_destaque_vaga.sql`) e `jobs_feed` ganhou um critério de ordenação **antes**
do `is_urgent` — `(destacada_ate is not null and destacada_ate > now()) desc`. Com a coluna sempre
null hoje, a ordenação atual não muda em nada na prática.

## Cadastro completo do contratante + PIN de e-mail

Publicar vaga passou a exigir e-mail confirmado, nome completo, CPF válido, telefone e endereço —
`hirer_profiles` não tinha nenhum desses campos (migration `20260822030000_hirer_completo.sql`).

**PIN substitui o link mágico**, pras duas personas, não só pro contratante: `verifyOtp` da própria
lib do Supabase Auth, decidido assim porque manter dois mecanismos de confirmação (link pra um tipo
de conta, código pro outro) seria complexidade sem ganho, e código tende a converter melhor que link
em mobile. `(auth)/confirmar-email.tsx` foi reescrita: era "abra o link", virou um campo de dígitos
(`src/components/PinInput.tsx`, novo — caixas decorativas com largura flexível (`flex: 1`, não fixa)
+ um `TextInput` real invisível por cima, pra herdar autofill de código do SMS/e-mail de graça).

⚠️ **Isso exige duas trocas manuais no Dashboard do Supabase**, nenhuma delas cabe numa migration:

1. **Emails → SMTP Settings**: o Supabase só libera editar o template de e-mail depois que um SMTP
   customizado é configurado (não é bloqueio de plano pago — é a mensagem "Set up custom SMTP to
   edit templates"). Apontar pro Resend: host `smtp.resend.com`, porta `587`, usuário `resend`,
   senha = `RESEND_API_KEY`, remetente de um domínio verificado no Resend.
2. **Emails → Templates → Confirm signup**: trocar `{{ .ConfirmationURL }}` pelo código
   `{{ .Token }}` no corpo (como texto, não como `href` de um link — o editor do Supabase às vezes
   sugere `<a href="{{ .Token }}">`, que é inválido).

Até essas duas trocas acontecerem, o e-mail que sai continua sendo o link antigo do Supabase, e
`verifyOtp` não tem código nenhum pra validar.

### Duas armadilhas que custaram tempo de debug

- **`type` errado no `verifyOtp`**: o tipo certo pra verificar o código de confirmação de signup é
  `"email"`, não `"signup"` — esse último é do OUTRO fluxo (link com `token_hash`). Usar `"signup"`
  aqui faz o Supabase recusar até o código certo, com `{"code":"otp_expired","message":"Token has
  expired or is invalid"}` — a mesma mensagem genérica de "código errado", o que engana. `resend()`
  continua com `type: "signup"` — é uma API diferente, com enum de `type` diferente, e ali
  `"signup"` é o valor certo.
- **Tamanho do código não é sempre 6**: "Number of characters used in the email OTP" é configurável
  por projeto (Dashboard → Authentication → Providers → Email). Este projeto está em **8**, não no
  padrão de 6 — testado direto na API (`/auth/v1/admin/generate_link` devolve o `email_otp` em
  texto puro, útil pra depurar sem precisar ler e-mail nenhum). Com o campo travado em 6 caixas, o
  app cortava os 2 últimos dígitos e caía exatamente no mesmo erro de "expirado". `TAMANHO_CODIGO`
  em `confirmar-email.tsx` é a fonte da verdade no código — se o valor mudar no Dashboard, muda ali
  também.

Trava em dois níveis: `vaga/nova.tsx` bloqueia a publicação com uma tela de "complete seu cadastro"
antes do formulário (reaproveitando o mesmo padrão visual do bloqueio "só contratante publica" que
já existia), levando pra `perfil/completar-cadastro.tsx` (CPF com dígito verificador validado em
`src/lib/cpf.ts`, CEP com autocompletar via ViaCEP — API pública, sem chave). E a RLS de INSERT em
`jobs` ganhou a mesma checagem como defesa (`hirer_cadastro_completo()` + `email_confirmado()`, duas
novas funções `SECURITY DEFINER`, mesmo padrão de `is_job_owner`/`me_candidatei`) — mesmo que alguém
contorne a checagem client-side, o banco recusa.

## Redefinição de senha (deep link)

`recuperar-senha.tsx` pede o reset via `resetPasswordForEmail({ redirectTo: "sollo://redefinir-senha" })`.
Como o client roda com `detectSessionInUrl: false` (a config certa pra React Native — sem isso ele
tenta ler token de uma URL de browser que não existe aqui), quem processa esse link é a própria
tela nova `(auth)/redefinir-senha.tsx`, na mão: lê a URL que abriu o app (`expo-linking`), extrai
`access_token`/`refresh_token` do fragmento (`#...`), ativa a sessão de recuperação com
`setSession`, e só então deixa definir a nova senha via `updateUser({ password })`.

Pra esse link funcionar de ponta a ponta, o Supabase precisa saber que essas URLs são permitidas —
**Dashboard → Authentication → URL Configuration**:

- **Site URL**: `https://www.sollo.business`
- **Redirect URLs**: `sollo://redefinir-senha` (app nativo) e `https://app.sollo.business/redefinir-senha`
  (mesma tela na versão web, quando publicada nesse subdomínio)

## Pendências

1. **SMTP do Auth** — o Supabase só libera editar o template de e-mail (pra trocar o link mágico
   pelo código `{{ .Token }}`) depois que um SMTP customizado é configurado. Apontar pro Resend
   (Dashboard → Authentication → Emails → SMTP Settings: host `smtp.resend.com`, porta `587`,
   usuário `resend`, senha = `RESEND_API_KEY`, remetente de um domínio verificado no Resend — não
   dá pra usar `onboarding@resend.dev`, que só entrega pro dono da conta). Resolve de uma vez o
   template do PIN e o teto baixo de e-mails/hora do SMTP padrão do Supabase.
2. **URL Configuration** — ver seção acima; sem isso o link de redefinição de senha cai no Site URL
   em vez de abrir o app.
3. **Integração com o Asaas** — o botão "Destacar vaga" está pronto na UI, falta o backend de
   pagamento de verdade (webhook de confirmação de PIX, atualização de `destacada_ate`).
4. **Login social** (Google/Apple) — não implementado; Apple Sign In é exigido pela App Store
   se houver login social de terceiros.
