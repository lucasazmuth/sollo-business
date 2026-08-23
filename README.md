# Sollo Business — Landing page

Landing page da Sollo Business em **Next.js 16 (App Router) + React 19 + TypeScript**, animada com
**GSAP 3**, pronta para deploy na **Vercel**. Conteúdo baseado em `copy-landing-page-sollo.md`
e identidade visual do manual `SOLLO Branding`.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em <http://localhost:3000>. Build de produção: `npm run build && npm start`.

## Deploy na Vercel

O projeto é zero-config — a Vercel detecta o Next.js sozinha.

**Pelo dashboard:** suba o repositório para o GitHub/GitLab, importe em
[vercel.com/new](https://vercel.com/new) e clique em Deploy.

**Pela CLI:**

```bash
npx vercel
```

E para produção:

```bash
npx vercel --prod
```

### Variáveis de ambiente

Configure em *Project → Settings → Environment Variables* (referência em `.env.example`):

| Variável | Obrigatória | Para quê |
| -------- | ----------- | -------- |
| `NEXT_PUBLIC_SITE_URL` | não | URL canônica nas metatags OG/Twitter. Sem ela, usa o domínio de produção da Vercel. |
| `CONTACT_WEBHOOK_URL` | só para receber o formulário | Webhook (Zapier, Make, n8n, Slack, Discord) que recebe as mensagens de parceria. |

Sem `CONTACT_WEBHOOK_URL`, a rota `/api/contato` responde **501** e o formulário mostra o aviso
ao usuário — nada é dado como enviado por engano.

## Repositório

| Pasta | O que é |
| ----- | ------- |
| raiz  | landing page Next.js (deploy na Vercel) |
| [`mobile/`](mobile/README.md) | app React Native + Expo (splash e fluxo de auth) |
| `legacy-static/` | versão HTML/CSS/JS original da landing, como referência |

`mobile/` e `legacy-static/` estão no `.vercelignore` — não entram no deploy da web.

## Estrutura

```
app/
  layout.tsx            metadata, OG, next/font (Montserrat)
  page.tsx              composição das seções
  globals.css           tokens da marca, componentes, responsivo
  api/contato/route.ts  recebe o formulário e repassa ao webhook
components/
  BrandSprite.tsx       logotipo vetorizado (symbols mk-wordmark / mk-icon)
  Preloader.tsx         contador + revelação do logo por máscara
  Cursor.tsx            cursor customizado
  Header.tsx            header, progresso e menu mobile
  SmoothScroll.tsx      ScrollSmoother + navegação por âncoras
  ReadyProvider.tsx     avisa as seções quando o preloader termina
  anim/                 SplitReveal, Fade e MagneticLink (reutilizáveis)
  sections/             uma seção por arquivo
content/site.ts         TODO o texto da página em um só lugar
lib/gsap.ts             registro dos plugins + helpers
legacy-static/          versão HTML/CSS/JS original (referência; fora do deploy)
```

**Para editar textos, mexa só em `content/site.ts`** — etapas, serviços, planos, FAQ,
comunidades, depoimentos e links do rodapé estão todos lá.

## Como o GSAP roda no React

- `lib/gsap.ts` registra os plugins uma única vez e exporta tudo.
- Toda animação usa `useGSAP()` (`@gsap/react`), que limpa timelines e ScrollTriggers
  automaticamente no unmount — essencial com o Fast Refresh e o StrictMode.
- Componentes com animação são `"use client"`; as seções puramente estáticas
  (Manifesto, Perks, Team, Footer) continuam server components.
- O `ScrollSmoother` exige a estrutura `#smooth-wrapper > #smooth-content`, criada em
  `SmoothScroll.tsx`.
- Em desenvolvimento, `window.gsap` fica exposto para inspecionar timelines no console.

Plugins usados (todos gratuitos desde o GSAP 3.13): ScrollTrigger, ScrollSmoother, SplitText,
ScrollToPlugin, Observer, Draggable, InertiaPlugin.

## Identidade aplicada

| Token | Hex | Uso |
| ----- | --- | --- |
| `--magenta` | `#d81368` | cor principal, CTAs |
| `--pink` | `#ee53a9` | gradientes, blobs |
| `--lime` | `#cefe2a` | acento, hover dos botões |
| `--black` | `#000000` | fundo ("noite, backstage") |
| `--white` | `#ffffff` | texto |
| `--concrete` | `#d9d9d9` | seções claras |

Tipografia **Montserrat** via `next/font` (self-hosted, sem requisição ao Google em runtime).

O logotipo foi vetorizado a partir dos PNGs do manual e vive em `components/BrandSprite.tsx`.
Para trocar pelo SVG oficial, substitua o conteúdo dos `<symbol>` mantendo os ids
`mk-wordmark` e `mk-icon`.

## Imagens

Três retratos editoriais (`public/img/pro-*.jpg`) vieram de `SOLLO/Imag/`, redimensionados de
~10 MB para ~150 KB cada e servidos via `next/image`:

| Arquivo | Onde aparece |
| ------- | ------------ |
| `pro-coat.jpg` | Conecte-se → painel "Com contratantes" |
| `pro-flowers.jpg` | Conecte-se → painel "Com profissionais" |
| `pro-smile.jpg` | Comunidades → figura com parallax |

Substituíram as esferas em degradê que ocupavam esses espaços. Sobre a foto vai um degradê
magenta em `multiply` (`.connect__figure-tint`), que amarra o editorial à paleta da marca.

**Não** usei essas fotos na Equipe nem nos Depoimentos: seriam rostos de banco de imagens
apresentados como funcionários e clientes reais. Confirme também a licença de uso comercial
antes de publicar.

## Antes de publicar — pendências

Todas marcadas com comentários `PLACEHOLDER` em `content/site.ts` e nos componentes:

1. **Parceiros** — marquee com itens genéricos "Parceiro"; trocar pelos logos reais.
2. **Depoimentos** — os textos vieram da copy de referência e citam a marca "Sanny"
   (Melissa Lewis, Jake Jake, Bruce Ng, Vincent Kapoor). São de outro projeto:
   substituir por depoimentos reais.
3. **Equipe** — quatro cards "Nome Sobrenome / Cargo" com orbes no lugar das fotos.
4. **FAQ** — a copy trazia só título e introdução; as cinco respostas foram redigidas a partir
   dos fatos da própria copy (comissão de 5%, PIX, reembolso, limites). Validar com o time.
5. **Redes sociais** do rodapé com `href="#"`.
6. **Formulário** — definir `CONTACT_WEBHOOK_URL` (ou trocar a rota por um provedor de e-mail).

Observações sobre a copy original: o item 17 é apenas "AI", solto dentro da Etapa 4 — foi tratado
como ruído e a etapa ficou "Confirmação e liberação"; e "quipes" foi corrigido para "equipes".

## Ajustes rápidos

- **Cores e tipografia**: `:root` no topo de `app/globals.css`.
- **Velocidade do scroll suave**: `smooth: 1.15` em `components/SmoothScroll.tsx`.
- **Percurso do scroll horizontal**: largura de `.step` (`clamp(280px, 38vw, 520px)`).
- **Desligar o preloader**: remova `<Preloader />` de `app/page.tsx` — o `ReadyProvider`
  continua funcionando e o hero anima na entrada.
