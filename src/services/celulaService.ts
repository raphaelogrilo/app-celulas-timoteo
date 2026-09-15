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

/**
 * Busca a célula principal vinculada a um líder pelo e-mail ou UID.
 */
export async function getCelulaByLiderEmailOrUid(
  emailOrUid: string
): Promise<Celula | null> {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .or(`lider_email.ilike.${emailOrUid},lider_user_id.eq.${emailOrUid}`)
    .maybeSingle();

  if (error || !data) return null;
  return mapFromRow(data);
}

/**
 * Busca TODAS as células pertencentes a um determinado líder.
 */
export async function getCelulasByLiderEmailOrUid(
  emailOrUid: string
): Promise<Celula[]> {
  const { data, error } = await supabase
    .from(TABELA)
    .select('*')
    .or(`lider_email.ilike.${emailOrUid},lider_user_id.eq.${emailOrUid}`)
    .order('criado_em', { ascending: false });

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
