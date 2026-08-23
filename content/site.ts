/**
 * Todo o conteúdo da landing page em um só lugar.
 * Texto extraído de copy-landing-page-sollo.md.
 */

export const site = {
  name: "Sollo Business",
  email: "contato@sollo.business",
  title: "Sollo Business: o marketplace pensado para o mercado do entretenimento",
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
    text: "Vocês fecham valores e prazos direto pelo chat integrado, sem intermediário: o pagamento é combinado entre as partes."
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
    text: "Depois da entrega, cliente e profissional se avaliam mutuamente. É essa reputação que decide quem entra na próxima vaga."
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
    text: "Crie e publique sua vaga na Sollo Business e receba candidaturas de profissionais dentro do raio que você definir. Quanto mais urgente, mais rápido a notificação chega perto de você."
  },
  {
    n: "03",
    title: "Chat integrado",
    sub: "Converse e combine tudo",
    text: "Converse com os candidatos, organize os arquivos que você recebe e feche os detalhes direto pelo chat. Com nosso chat inteligente, você tem o controle total na palma da sua mão, sempre atualizado sobre o status da próxima etapa!"
  },
  {
    n: "04",
    title: "Avaliações",
    sub: "Reputação que conta",
    text: "Depois de cada trabalho, contratante e profissional se avaliam mutuamente. É essa nota que constrói a reputação de cada um dentro da plataforma e ajuda a decidir a próxima contratação."
  }
];

export const connectTabs = [
  {
    id: "contratantes",
    tab: "Com contratantes",
    title: "Anuncie sua vaga",
    text: "Na Sollo Business, você pode se conectar com uma comunidade de profissionais criativos e qualificados com facilidade. É só publicar suas vagas e encontrar candidatos ideais em uma plataforma integrada e prática. Não perca tempo, encontre o talento que você precisa agora mesmo!",
    stats: [
      { n: "200+", l: "tipos de serviços" },
      { n: "0", l: "custo por anúncio" },
      { n: "km", l: "busca por raio de urgência" }
    ],
    cta: { label: "Publicar uma vaga", variant: "magenta" as const }
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
    cta: { label: "Criar meu perfil", variant: "lime" as const }
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
    a: "Audiovisual, design, música, fotografia, produção de eventos e muitas outras. São mais de 200 tipos de serviços disponíveis."
  }
];

export const footerGroups = [
  {
    title: "Plataforma",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Serviços", href: "#servicos" },
      { label: "Planos", href: "#comissao" }
    ]
  },
  {
    title: "Comunidade",
    links: [
      { label: "Comunidades", href: "#comunidades" },
      { label: "Conecte-se", href: "#conecte-se" }
    ]
  },
  {
    title: "Suporte",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "contato@sollo.business", href: "mailto:contato@sollo.business" }
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
