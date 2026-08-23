/**
 * Camada de autenticação — Supabase Auth.
 *
 * As telas não sabem que existe Supabase: falam só com estas funções.
 * Erros do provedor são traduzidos para português e atribuídos ao campo
 * responsável, que é o que a UI precisa para destacar o input certo.
 */
import { supabase } from "@/src/lib/supabase";

export type AccountType = "profissional" | "contratante";

export type User = {
  id: string;
  nome: string;
  email: string;
  tipo: AccountType;
};

/** Causas que a UI precisa tratar de forma diferente de "mostrar o texto". */
export type AuthErrorMotivo = "email_nao_confirmado";

export class AuthError extends Error {
  field?: "nome" | "email" | "senha";
  motivo?: AuthErrorMotivo;

  constructor(message: string, field?: AuthError["field"], motivo?: AuthErrorMotivo) {
    super(message);
    this.name = "AuthError";
    this.field = field;
    this.motivo = motivo;
  }
}

/**
 * Use isto em vez de `e instanceof AuthError` nas telas.
 *
 * `instanceof` compara identidade de classe, e o Fast Refresh redefine a
 * classe quando só um dos módulos recarrega — a tela passa a comparar contra
 * uma classe diferente da que foi lançada e a checagem falha em silêncio,
 * caindo no erro genérico. Checar pelo `name` é estável entre recargas.
 */
export function ehAuthError(e: unknown): e is AuthError {
  return e instanceof Error && e.name === "AuthError";
}

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Regras mínimas de senha usadas no cadastro. */
export function passwordIssue(senha: string): string | null {
  if (senha.length < 8) return "Use pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(senha) || !/[0-9]/.test(senha)) return "Misture letras e números.";
  return null;
}

/** Traduz a mensagem crua do provedor para algo acionável. */
function traduz(mensagem: string): AuthError {
  const m = mensagem.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return new AuthError("E-mail ou senha incorretos.", "senha");
  }
  if (m.includes("email not confirmed")) {
    // A tela de login usa o motivo pra levar direto à confirmação por código,
    // em vez de deixar a pessoa presa num erro sem saída.
    return new AuthError(
      "Confirme seu e-mail antes de entrar.",
      "email",
      "email_nao_confirmado"
    );
  }
  if (m.includes("already registered") || m.includes("already been registered")) {
    return new AuthError("Já existe uma conta com esse e-mail.", "email");
  }
  if (m.includes("password should be")) {
    return new AuthError("Senha muito curta.", "senha");
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return new AuthError("Muitas tentativas. Espere alguns minutos.");
  }
  if (m.includes("unable to validate email") || m.includes("invalid email")) {
    return new AuthError("Informe um e-mail válido.", "email");
  }
  return new AuthError("Não foi possível concluir agora. Tente de novo.");
}

export async function signIn(email: string, senha: string): Promise<void> {
  if (!isEmail(email)) throw new AuthError("Informe um e-mail válido.", "email");
  if (!senha) throw new AuthError("Informe sua senha.", "senha");

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: senha
  });

  if (error) throw traduz(error.message);
}

export type SignUpResult = {
  /** true quando o projeto exige confirmação por e-mail e ainda não há sessão. */
  precisaConfirmarEmail: boolean;
};

export async function signUp(input: {
  nome: string;
  email: string;
  senha: string;
  tipo: AccountType;
}): Promise<SignUpResult> {
  if (input.nome.trim().length < 2) throw new AuthError("Como podemos te chamar?", "nome");
  if (!isEmail(input.email)) throw new AuthError("Informe um e-mail válido.", "email");

  const issue = passwordIssue(input.senha);
  if (issue) throw new AuthError(issue, "senha");

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.senha,
    // Lido pelo trigger handle_new_user, que cria o perfil e as preferências.
    options: { data: { nome: input.nome.trim(), tipo: input.tipo } }
  });

  if (error) throw traduz(error.message);

  return { precisaConfirmarEmail: data.session === null };
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!isEmail(email)) throw new AuthError("Informe um e-mail válido.", "email");

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: "sollo://redefinir-senha"
  });

  if (error) throw traduz(error.message);
}

/**
 * Encerra a sessão no servidor, mas **nunca** deixa a pessoa presa no app
 * se isso falhar.
 *
 * O `signOut()` padrão chama a API com o token atual. Quando esse token não
 * vale mais — conta apagada no painel, token revogado, refresh expirado ou
 * simplesmente sem rede — a chamada falha e a sessão local continua no
 * Keychain: o app segue "logado" numa conta que não existe, sem botão de
 * saída que funcione. O fallback com `scope: "local"` só limpa o
 * armazenamento local, sem depender do servidor.
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (!error) return;
  } catch {
    // Cai no fallback local abaixo.
  }

  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
}

/**
 * Apaga a conta e todos os dados vinculados (perfil, vagas, candidaturas,
 * mensagens, avaliações) — via `delete_own_account`, que remove a linha em
 * `auth.users` e deixa o `on delete cascade` do banco cuidar do resto.
 * Exigência da Apple (App Store Review 5.1.1(v)) para apps com conta.
 */
export async function excluirConta(): Promise<void> {
  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw traduz(error.message);
  await supabase.auth.signOut();
}
