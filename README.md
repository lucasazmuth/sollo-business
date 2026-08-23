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

## Repositório

| Pasta | O que é |
| ----- | ------- |
| raiz  | landing page Next.js (deploy na Vercel) |
| [`mobile/`](mobile/README.md) | app React Native + Expo (splash e fluxo de auth) |
| `legacy-static/` | versão HTML/CSS/JS original da landing, como referência |

`legacy-static/` está no `.vercelignore` da raiz — não entra no deploy da landing. `mobile/` **não**
está mais lá: ele também é publicado na Vercel, como projeto separado (Root Directory `mobile`,
usando `mobile/vercel.json`) — veja [mobile/README.md](mobile/README.md#eas--build-e-submissão).

## Estrutura

```
app/
  layout.tsx            metadata, OG, next/font (Montserrat)
  page.tsx              composição das seções
  globals.css           tokens da marca, componentes, responsivo
  termos/page.tsx        termos de uso
  privacidade/page.tsx   política de privacidade
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
comunidades e links do rodapé estão todos lá.

## Como o GSAP roda no React

- `lib/gsap.ts` registra os plugins uma única vez e exporta tudo.
- Toda animação usa `useGSAP()` (`@gsap/react`), que limpa timelines e ScrollTriggers
  automaticamente no unmount — essencial com o Fast Refresh e o StrictMode.
- Componentes com animação são `"use client"`; as seções puramente estáticas
  (Manifesto, Perks, Footer) continuam server components.
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

A landing não usa fotos — os dois espaços que antes tinham retratos editoriais (Conecte-se e
Comunidades) foram trocados por composições geométricas (`.blob`, mesma linguagem visual da Hero:
esferas em gradiente radial magenta/pink/lime). Evita duas dores de uma vez: licença de uso de
banco de imagem e fotos de banco apresentadas como se fossem pessoas reais da plataforma. Ver
`.connect__blob--*` / `.communities__blob--*` em `app/globals.css`.

O único asset de imagem real que resta é o logotipo (`components/BrandSprite.tsx`, vetorizado a
partir dos PNGs do manual).

## Antes de publicar — pendências

Marcadas com comentário `PLACEHOLDER` em `content/site.ts`:

1. **FAQ** — a copy trazia só título e introdução; as cinco respostas foram redigidas a partir
   dos fatos da própria copy. Validar com o time.
2. **Redes sociais** do rodapé com `href="#"`.
3. **Formulário de parcerias** — removido por enquanto (a seção "Parcerias" mostra só o e-mail de
   contato); se voltar, precisa de um destino real pro envio (webhook ou provedor de e-mail).

Observações sobre a copy original: o item 17 é apenas "AI", solto dentro da Etapa 4 — foi tratado
como ruído e a etapa ficou "Confirmação e liberação"; e "quipes" foi corrigido para "equipes".

## Ajustes rápidos

- **Cores e tipografia**: `:root` no topo de `app/globals.css`.
- **Velocidade do scroll suave**: `smooth: 1.15` em `components/SmoothScroll.tsx`.
- **Percurso do scroll horizontal**: largura de `.step` (`clamp(280px, 38vw, 520px)`).
- **Desligar o preloader**: remova `<Preloader />` de `app/page.tsx` — o `ReadyProvider`
  continua funcionando e o hero anima na entrada.
