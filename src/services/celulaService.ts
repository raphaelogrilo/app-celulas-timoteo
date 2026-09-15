import { supabase } from '../lib/supabase';
import type { Celula, EncontroAtual } from '../types/celula';

const TABELA = 'celulas';

// Converter linha do Supabase (snake_case) para modelo de Celula do App (camelCase)
function mapFromRow(row: any): Celula {
  const encontroAtual = row.encontro_atual as EncontroAtual | undefined;
  return {
    id: row.id,
    nome: row.nome,
    perfil: row.perfil,
    ministerio: row.ministerio || undefined,
    lider: row.lider,
    telefone: row.telefone,
    fotoLider: row.foto_lider || undefined,
    descricao: row.descricao || undefined,
    faixaEtaria: row.faixa_etaria || undefined,
    ativo: row.ativo ?? true,
    itinerante: row.itinerante ?? false,
    dia: row.dia || undefined,
    horario: row.horario || undefined,
    cep: row.cep || undefined,
    endereco: row.endereco || undefined,
    bairro: row.bairro || undefined,
    pontoReferencia: row.ponto_referencia || undefined,
    coords: row.lat && row.lng ? { lat: Number(row.lat), lng: Number(row.lng) } : undefined,
    encontroAtual,
    locaisItinerantes: encontroAtual?.locais || undefined,
    liderUid: row.lider_user_id || row.lider_id || undefined,
    liderEmail: row.lider_email || undefined,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

// Converter modelo de Celula para formato de inserção/atualização do banco
function mapToRow(data: Partial<Celula>) {
  const row: Record<string, any> = {};
  if (data.nome !== undefined) row.nome = data.nome;
  if (data.perfil !== undefined) row.perfil = data.perfil;
  if (data.ministerio !== undefined) row.ministerio = data.ministerio;
  if (data.lider !== undefined) row.lider = data.lider;
  if (data.telefone !== undefined) row.telefone = data.telefone;
  if (data.fotoLider !== undefined) row.foto_lider = data.fotoLider;
  if (data.descricao !== undefined) row.descricao = data.descricao;
  if (data.faixaEtaria !== undefined) row.faixa_etaria = data.faixaEtaria;
  if (data.ativo !== undefined) row.ativo = data.ativo;
  if (data.itinerante !== undefined) row.itinerante = data.itinerante;
  if (data.dia !== undefined) row.dia = data.dia;
  if (data.horario !== undefined) row.horario = data.horario;
  if (data.cep !== undefined) row.cep = data.cep;
  if (data.endereco !== undefined) row.endereco = data.endereco;
  if (data.bairro !== undefined) row.bairro = data.bairro;
  if (data.pontoReferencia !== undefined) row.ponto_referencia = data.pontoReferencia;
  if (data.coords !== undefined) {
    row.lat = data.coords?.lat ?? null;
    row.lng = data.coords?.lng ?? null;
  }
  if (data.encontroAtual !== undefined || data.locaisItinerantes !== undefined) {
    const encontro = data.encontroAtual ? { ...data.encontroAtual } : ({} as any);
    if (data.locaisItinerantes !== undefined) {
      encontro.locais = data.locaisItinerantes;
    }
    row.encontro_atual = encontro;
  }
  if (data.liderEmail !== undefined) row.lider_email = data.liderEmail;
  if (data.liderUid !== undefined) row.lider_user_id = data.liderUid;
  return row;
}

/**
 * Escuta em tempo real todas as células ativas no Supabase (para o mapa público).
 * Retorna uma função de cancelamento da inscrição.
 */
export function listenCelulas(
  callback: (celulas: Celula[]) => void
): () => void {
  const fetchAll = async () => {
    const { data, error } = await supabase
      .from(TABELA)
      .select('*')
      .eq('ativo', true);

    if (!error && data) {
      callback(data.map(mapFromRow));
    }
  };

  fetchAll();

  const channel = supabase
    .channel('public_celulas_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABELA },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Escuta em tempo real TODAS as células (ativas e inativas) para o Painel Geral Admin.
 */
export function listenAllCelulasAdmin(
  callback: (celulas: Celula[]) => void
): () => void {
  const fetchAll = async () => {
    const { data, error } = await supabase
      .from(TABELA)
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      callback(data.map(mapFromRow));
    }
  };

  fetchAll();

  const channel = supabase
    .channel('admin_all_celulas_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABELA },
      () => {
        fetchAll();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Busca todas as células (incluindo inativas para Admin).
 */
export async function getAllCelulasAdmin(): Promise<Celula[]> {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error('Erro ao buscar células admin:', error);
    return [];
  }

  return (data || []).map(mapFromRow);
}

/**
 * Busca uma única célula por ID.
 */
export async function getCelulaById(id: string): Promise<Celula | null> {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapFromRow(data);
}

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

/**
 * Busca a célula principal vinculada a um líder pelo e-mail ou UID.
 */
export async function getCelulaByLiderEmailOrUid(
  emailOrUid: string
): Promise<Celula | null> {
  const clean = emailOrUid.trim();
  let query = supabase.from(TABELA).select('*');

  if (isUUID(clean)) {
    query = query.or(`lider_user_id.eq.${clean},lider_id.eq.${clean}`);
  } else {
    query = query.ilike('lider_email', clean);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;
  return mapFromRow(data);
}

/**
 * Busca TODAS as células pertencentes a um determinado líder.
 */
export async function getCelulasByLiderEmailOrUid(
  emailOrUid: string
): Promise<Celula[]> {
  const clean = emailOrUid.trim();
  let query = supabase.from(TABELA).select('*');

  if (isUUID(clean)) {
    query = query.or(`lider_user_id.eq.${clean},lider_id.eq.${clean}`);
  } else {
    query = query.ilike('lider_email', clean);
  }

  const { data, error } = await query.order('criado_em', { ascending: false });

  if (error || !data) return [];
  return data.map(mapFromRow);
}

/**
 * Escuta em tempo real as células de um determinado líder.
 */
export function listenCelulasLider(
  emailOrUid: string,
  callback: (celulas: Celula[]) => void
): () => void {
  const fetchLeaderCelulas = async () => {
    const list = await getCelulasByLiderEmailOrUid(emailOrUid);
    callback(list);
  };

  fetchLeaderCelulas();

  const channel = supabase
    .channel(`lider_celulas_${emailOrUid.replace(/[^a-zA-Z0-9]/g, '_')}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABELA },
      () => {
        fetchLeaderCelulas();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Cria uma nova célula no Supabase.
 */
export async function createCelula(
  data: Omit<Celula, 'id' | 'criadoEm' | 'atualizadoEm'>
): Promise<string> {
  const row = mapToRow(data);
  const { data: inserted, error } = await supabase
    .from(TABELA)
    .insert([{ ...row, ativo: true }])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Erro ao cadastrar célula: ${error.message}`);
  }

  return inserted.id;
}

/**
 * Atualiza dados gerais de uma célula.
 */
export async function updateCelula(
  id: string,
  data: Partial<Omit<Celula, 'id'>>
): Promise<void> {
  const row = mapToRow(data);
  const { error } = await supabase
    .from(TABELA)
    .update(row)
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao atualizar célula: ${error.message}`);
  }
}

/**
 * Atualiza apenas o "encontroAtual" de uma célula itinerante.
 */
export async function updateEncontroAtual(
  celulaId: string,
  encontro: EncontroAtual
): Promise<void> {
  const { error } = await supabase
    .from(TABELA)
    .update({ encontro_atual: encontro })
    .eq('id', celulaId);

  if (error) {
    throw new Error(`Erro ao atualizar endereço itinerante: ${error.message}`);
  }
}

/**
 * Inativa/ativa uma célula (soft delete).
 */
export async function toggleCelulaAtivo(
  id: string,
  ativo: boolean
): Promise<void> {
  const { error } = await supabase
    .from(TABELA)
    .update({ ativo })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao alternar status da célula: ${error.message}`);
  }
}

import { CELULAS_SEED } from '../data/celulas';

/**
 * Deleta permanentemente uma célula (somente admin).
 */
export async function deleteCelula(id: string): Promise<void> {
  const { error } = await supabase
    .from(TABELA)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao remover célula: ${error.message}`);
  }
}

/**
 * Reseta o banco de células e insere as 13 células oficiais com coordenadas exatas.
 */
export async function resetAndSeedOfficialCelulas(): Promise<void> {
  // 1. Remover células atuais
  const { error: deleteError } = await supabase
    .from(TABELA)
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todas

  if (deleteError) {
    console.warn('Erro ao deletar células existentes:', deleteError.message);
  }

  // 2. Inserir as 13 novas células
  const rows = CELULAS_SEED.map((c) => {
    const row = mapToRow(c);
    return {
      ...row,
      ativo: true,
    };
  });

  const { error: insertError } = await supabase
    .from(TABELA)
    .insert(rows);

  if (insertError) {
    throw new Error(`Erro ao inserir as 13 células oficiais: ${insertError.message}`);
  }
}
