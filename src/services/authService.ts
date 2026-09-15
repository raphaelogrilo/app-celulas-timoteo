import { supabase } from '../lib/supabase';
import type { LiderUser } from '../types/celula';

/**
 * Inicia o fluxo de autenticação com o Google via Supabase OAuth.
 */
export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/lider/dashboard`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Encerra a sessão atual.
 */
export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Verifica se o e-mail Google pertence a um líder autorizado pelo Admin.
 */
export async function getLiderByEmail(email: string): Promise<LiderUser | null> {
  const { data, error } = await supabase
    .from('lideres')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar líder por email:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    uid: data.user_id || data.id,
    userId: data.user_id,
    email: data.email,
    nome: data.nome,
    isAdmin: data.is_admin ?? false,
    celulaId: data.celula_id,
    criadoEm: data.criado_em,
  };
}

/**
 * Vincula o Auth User ID ao registro do líder cadastrado previamente.
 */
export async function vincularAuthUserId(email: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('lideres')
    .update({ user_id: userId, atualizado_em: new Date().toISOString() })
    .ilike('email', email.trim());

  if (error) {
    console.error('Erro ao vincular user_id do líder:', error);
  }
}

/**
 * Busca todos os líderes autorizados cadastrados.
 */
export async function getAllLideres(): Promise<LiderUser[]> {
  const { data, error } = await supabase
    .from('lideres')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar líderes:', error);
    return [];
  }

  return (data || []).map((d) => ({
    id: d.id,
    uid: d.user_id || d.id,
    userId: d.user_id,
    email: d.email,
    nome: d.nome,
    isAdmin: d.is_admin ?? false,
    celulaId: d.celula_id,
    criadoEm: d.criado_em,
  }));
}

/**
 * Cria a autorização prévia de um novo líder (chamado exclusivamente pelo Admin).
 * Não necessita de senha pois o líder fará login seguro via Google OAuth com este e-mail.
 */
export async function createLider(
  email: string,
  nome: string,
  isAdmin = false
): Promise<string> {
  const { data, error } = await supabase
    .from('lideres')
    .insert([
      {
        email: email.trim().toLowerCase(),
        nome: nome.trim(),
        is_admin: isAdmin,
      },
    ])
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Este e-mail já está cadastrado para outro líder.');
    }
    throw new Error(error.message);
  }

  return data.id;
}

/**
 * Exclui a autorização de um líder.
 */
export async function deleteLider(id: string): Promise<void> {
  const { error } = await supabase.from('lideres').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Vincula um líder a uma célula.
 */
export async function vincularLiderCelula(
  liderIdOrEmail: string,
  celulaId: string
): Promise<void> {
  const clean = liderIdOrEmail.trim();
  const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  if (isId) {
    await supabase.from('lideres').update({ celula_id: celulaId }).eq('id', clean);
  } else {
    await supabase.from('lideres').update({ celula_id: celulaId }).ilike('email', clean);
  }
}
