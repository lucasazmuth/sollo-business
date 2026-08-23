/**
 * Todo o conteúdo da landing page em um só lugar.
 * Texto extraído de copy-landing-page-sollo.md.
 */

export const site = {
  name: "Sollo Business",
  email: "contato@sollo.app",
  title: "Sollo Business — O marketplace pensado para o mercado do entretenimento",
  description:
    "Encontre os melhores talentos do mercado, colabore em projetos e tire suas ideias do papel. Conecte-se, negocie e entregue com facilidade e segurança."
};

export const nav = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Serviços", href: "#servicos" },
  { label: "Comunidades", href: "#comunidades" },
  { label: "Planos", href: "#comissao" },
  { label: "FAQ", href: "#faq" }
];

export const menuLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Serviços", href: "#servicos" },
  { label: "Conecte-se", href: "#conecte-se" },
  { label: "Comunidades", href: "#comunidades" },
  { label: "Planos", href: "#comissao" },
  { label: "FAQ", href: "#faq" }
];

/* PLACEHOLDER: substituir pelos logos/nomes reais dos parceiros. */
export const partners = ["Parceiro", "Parceiro", "Parceiro", "Parceiro", "Parceiro", "Parceiro"];

export const steps = [
  {
    n: "01",
    label: "Etapa 1",
    title: "Orçamento personalizado",
    text: "Profissionais enviam propostas detalhadas com valores e prazos diretamente pelo nosso chat."
  },
  {
    n: "02",
    label: "Etapa 2",
    title: "Combine direto pelo chat",
    text: "Vocês fecham valores e prazos direto pelo chat integrado, sem intermediário — o pagamento é combinado entre as partes."
  },
  {
    n: "03",
    label: "Etapa 3",
    title: "Entrega",
    text: "O serviço é realizado como solicitado e dentro dos prazos acordados previamente entre cliente e profissional."
  },
  {
    n: "04",
    label: "Etapa 4",
    title: "Avaliação em duas vias",
    text: "Depois da entrega, cliente e profissional se avaliam mutuamente — é essa reputação que decide quem entra na próxima vaga."
  }
];

export const perks = [
  { icon: "bell", text: "Notificação em tempo real quando surge uma vaga urgente perto de você" },
  { icon: "chat", text: "Envie arquivos pelo nosso chat inteligente" },
  { icon: "calendar", text: "Tenha total controle da agenda e defina datas" },
  { icon: "shield", text: "Avaliação em duas vias no fim de cada trabalho" }
] as const;

export const services = [
  {
    n: "01",
    title: "Perfil",
    sub: "Seja encontrado",
    text: "Se destaque na plataforma criando um perfil impossível de ignorar! Adicione suas redes sociais, locais de trabalho anteriores e selecione as categorias que mais combinam com você ou seu negócio. Além disso, seu status de último acesso ficará registrado, assim é mais fácil as oportunidades encontrarem você!"
  },
  {
    n: "02",
    title: "Publicar anúncios",
    sub: "Publique e receba candidaturas",
    text: "Crie e publique seus anúncios na Sollo Business, receba candidaturas, inicie conversas com possíveis parceiros e peça orçamentos de forma simplificada em um só lugar."
  },
  {
    n: "03",
    title: "Chat integrado",
    sub: "Converse e combine tudo",
    text: "Converse com os candidatos, organize os arquivos que você recebe e feche os detalhes direto pelo chat. Com nosso chat inteligente, você tem o controle total na palma da sua mão, sempre atualizado sobre o status da próxima etapa!"
  },
  {
    n: "04",
    title: "Orçamentos personalizados",
    sub: "Sem burocracia",
    text: "Com o nosso sistema, você pode criar orçamentos detalhados com praticidade. Basta adicionar itens ao carrinho, incluindo título, descrição, valor e margem de lucro. E o melhor de tudo: você pode enviar tudo diretamente pelo chat, sem burocracia! Além disso, todos os orçamentos têm um status que pode ser facilmente editado."
  },
  {
    n: "05",
    title: "Gestão de projetos e equipes",
    sub: "Times e entregas",
    text: "Organize seu time e acompanhe o progresso de cada serviço solicitado. Você também pode vincular anúncios de vagas a projetos específicos, como eventos ou filmes, para garantir a máxima eficiência dos resultados."
  },
  {
    n: "06",
    title: "Drive",
    sub: "Tudo no mesmo lugar",
    text: "No chat você terá todos os arquivos enviados, organizados e acessíveis pela aba “Arquivos”. Dessa forma, você pode baixá-los a qualquer momento, mantendo tudo no mesmo lugar e fácil de gerenciar."
  }
];

export const connectTabs = [
  {
    id: "contratantes",
    tab: "Com contratantes",
    title: "Anuncie sua vaga",
    text: "Na Sollo Business, você pode se conectar com uma comunidade de profissionais criativos e qualificados com facilidade. É só publicar suas vagas e encontrar candidatos ideais em uma plataforma integrada e prática. Não perca tempo — encontre o talento que você precisa agora mesmo!",
    stats: [
      { n: "200+", l: "tipos de serviços" },
      { n: "0", l: "custo por anúncio" },
      { n: "km", l: "busca por raio de urgência" }
    ],
    cta: { label: "Publicar uma vaga", variant: "magenta" as const },
    image: { src: "/img/pro-coat.jpg", alt: "Profissional do audiovisual em retrato de estúdio" }
  },
  {
    id: "profissionais",
    tab: "Com profissionais",
    title: "Encontre a oportunidade",
    text: "Explore várias oportunidades em áreas como audiovisual, design, música e muito mais. Ao criar seu perfil, você tem a chance de exibir seu trabalho e ser descoberto(a) por profissionais que estão em busca do seu talento. Lembre-se: o próximo passo na sua carreira pode estar a apenas um clique de distância!",
    stats: [
      { n: "R$ 0", l: "cadastro" },
      { n: "2x", l: "avaliação em duas vias" },
      { n: "24/7", l: "suporte por tickets" }
    ],
    cta: { label: "Criar meu perfil", variant: "lime" as const },
    image: { src: "/img/pro-flowers.jpg", alt: "Artista em retrato editorial com flores" }
  }
];

export const communities = [
  "Audiovisual",
  "Música",
  "Design",
  "Fotografia",
  "Produção de eventos",
  "Dança",
  "Teatro",
  "Moda",
  "Maquiagem",
  "Influência digital",
  "Publicidade",
  "Edição e pós",
  "Iluminação",
  "Cenografia",
  "Locução"
];

export const plans = [
  {
    label: "Para profissionais",
    price: "R$ 0",
    note: "Sem taxa de cadastro",
    accent: false,
    items: ["Sem limites de candidatura", "Suporte contínuo por sistema de tickets"]
  },
  {
    label: "Para contratantes",
    price: "R$ 0",
    note: "Modelo de cobrança em definição",
    accent: true,
    items: [
      "Sem limites de projetos",
      "Sem cobrança de criação de anúncios",
      "Sem limites de candidatos aplicados"
    ]
  }
];

/* PLACEHOLDER: depoimentos vindos da copy de referência (citam a marca "Sanny").
   Substituir por depoimentos reais de clientes Sollo Business antes de publicar. */
export const quotes = [
  {
    text: "The Sanny team has changed our internal productivity for the better. We use automation for everything from childcare to ordering food for lunches.",
    name: "Melissa Lewis",
    role: "CEO of Kinder Bench",
    accent: false
  },
  {
    text: "This is the 3rd AI automation agency to create SMM bots for us. And this time, we were not mistaken in our choice.",
    name: "Jake Jake",
    role: "CDO of Goodnight SMM",
    accent: false
  },
  {
    text: "“We came to Sanny AI agency with just an idea on a piece of paper. But now we have an incredible product that has exceeded all possible expectations. And the 50 billion investment round is only proof of this.”",
    name: "Bruce Ng",
    role: "Co-founder and CEO of SPICE AI",
    accent: true
  },
  {
    text: "According to our observations, the bakery started saving about 33 working days per quarter thanks to comprehensive automation from Sanny AI agency.",
    name: "Vincent Kapoor",
    role: "Founder of La Boulangerie™",
    accent: false
  }
];

/* PLACEHOLDER: trocar nomes, cargos e fotos reais da equipe. */
export const team = [
  { name: "Nome Sobrenome", role: "Cargo" },
  { name: "Nome Sobrenome", role: "Cargo" },
  { name: "Nome Sobrenome", role: "Cargo" },
  { name: "Nome Sobrenome", role: "Cargo" }
];

/* PLACEHOLDER: respostas redigidas a partir das informações da copy — validar com o time. */
export const faq = [
  {
    q: "Quanto custa usar a Sollo Business?",
    a: "O cadastro é gratuito para profissionais e contratantes. Não há cobrança por publicar vagas ou se candidatar."
  },
  {
    q: "Como funciona o pagamento pelo serviço?",
    a: "Nesta fase, o pagamento é combinado direto entre cliente e profissional, fora da plataforma. Um fluxo de pagamento integrado está no roadmap."
  },
  {
    q: "Como funciona a avaliação?",
    a: "Depois da entrega, cliente e profissional se avaliam mutuamente. Essa nota fica no perfil de cada um e é o que constrói a reputação dentro da plataforma."
  },
  {
    q: "Quantos anúncios posso publicar?",
    a: "Não há limite de publicação de vagas, de projetos, nem de candidatos aplicados. Também não há cobrança pela criação de anúncios."
  },
  {
    q: "Quais áreas do entretenimento estão na plataforma?",
    a: "Audiovisual, design, música, fotografia, produção de eventos e muitas outras — são mais de 200 tipos de serviços disponíveis."
  }
];

export const footerGroups = [
  {
    title: "Plataforma",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Serviços", href: "#servicos" },
      { label: "Comissão", href: "#comissao" }
    ]
  },
  {
    title: "Comunidade",
    links: [
      { label: "Comunidades", href: "#comunidades" },
      { label: "Conecte-se", href: "#conecte-se" },
      { label: "Equipe", href: "#equipe" }
    ]
  },
  {
    title: "Suporte",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "contato@sollo.app", href: "mailto:contato@sollo.app" }
    ]
  },
  {
    /* PLACEHOLDER: apontar para os perfis reais. */
    title: "Social",
    links: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "TikTok", href: "#" }
    ]
  }
];
