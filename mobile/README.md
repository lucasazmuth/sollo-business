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
    recuperar-senha.tsx     link de redefinição
    confirmar-email.tsx     aguarda confirmação após o cadastro
  (app)/
    _layout.tsx             guarda de rota: sem sessão, volta para auth
    home.tsx                placeholder da área logada
    perfil/index.tsx        vitrine: avatar, métricas, categorias, portfólio
    perfil/editar.tsx       edição + upload de avatar e portfólio
    perfil/localizacao.tsx  base por GPS e raio de atuação
    feed.tsx                feed do profissional: raio, categoria, urgência
    vagas.tsx               minhas vagas (contratante)
    vaga/nova.tsx           publicar vaga
    vaga/[id]/index.tsx     detalhe, alcance, candidatura e cancelamento
    vaga/[id]/candidatos.tsx  lista, seleção e recusa (contratante)
    candidaturas.tsx        minhas candidaturas (profissional)
    perfil/[id].tsx         perfil público de outra pessoa
    notificacoes/index.tsx  inbox
    notificacoes/preferencias.tsx  canais, teto diário, silêncio
    conversas.tsx           lista de conversas
    conversa/[id].tsx       chat 1:1 (realtime)
    avaliacoes/index.tsx    avaliações pendentes
    avaliacoes/[jobId]/[ratedId].tsx  formulário de avaliação
src/
  theme/tokens.ts           cores, espaçamento, raios, tipografia
  theme/logo.ts             paths SVG do logotipo (os mesmos da web)
  components/               Logo, Button, Input, Screen, Avatar, Chip,
                            EnderecoInput, DataHoraInput, VagaCard
  api/profile.ts            queries e mutações de perfil (com retry)
  api/jobs.ts               criar, publicar, cancelar e listar vagas
  api/feed.ts               feed por raio (RPC jobs_feed_para_mim)
  api/applications.ts       candidatar, retirar, selecionar, recusar
  api/notifications.ts      inbox e preferências
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

## Pendências

1. **SMTP do Auth** — apontar para o Resend antes de abrir cadastro público.
2. **Login social** (Google/Apple) — não implementado; Apple Sign In é exigido pela App Store
   se houver login social de terceiros.
3. **Verificação de e-mail** e política de senha definitiva a combinar com o backend.
4. **Domínio `www.sollo.business`** — os links de termos/privacidade assumem esse domínio; ajustar
   se o domínio de produção mudar antes de builds de loja.
