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

export class AuthError extends Error {
  field?: "nome" | "email" | "senha";
  constructor(message: string, field?: AuthError["field"]) {
    super(message);
    this.name = "AuthError";
    this.field = field;
  }
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
    return new AuthError("Confirme seu e-mail antes de entrar.", "email");
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

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
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
