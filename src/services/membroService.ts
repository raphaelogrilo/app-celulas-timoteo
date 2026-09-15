import { supabase } from '../lib/supabase';
import type { MembroCelula, ChamadaCelula } from '../types/membro';

const TABELA_MEMBROS = 'membros_celula';
const TABELA_CHAMADAS = 'chamadas_celula';

const LOCAL_MEMBROS_KEY = 'app_celulas_local_membros';
const LOCAL_CHAMADAS_KEY = 'app_celulas_local_chamadas';

// Fallback Local Storage Helpers
function getLocalMembros(celulaId?: string): MembroCelula[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEMBROS_KEY);
    const list: MembroCelula[] = raw ? JSON.parse(raw) : [];
    return celulaId ? list.filter(m => m.celulaId === celulaId) : list;
  } catch {
    return [];
  }
}

function saveLocalMembros(membros: MembroCelula[]) {
  try {
    localStorage.setItem(LOCAL_MEMBROS_KEY, JSON.stringify(membros));
  } catch (err) {
    console.warn('Erro ao salvar membros no storage local:', err);
  }
}

function getLocalChamadas(celulaId?: string): ChamadaCelula[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHAMADAS_KEY);
    const list: ChamadaCelula[] = raw ? JSON.parse(raw) : [];
    return celulaId ? list.filter(c => c.celulaId === celulaId) : list;
  } catch {
    return [];
  }
}

function saveLocalChamadas(chamadas: ChamadaCelula[]) {
  try {
    localStorage.setItem(LOCAL_CHAMADAS_KEY, JSON.stringify(chamadas));
  } catch (err) {
    console.warn('Erro ao salvar chamadas no storage local:', err);
  }
}

// Mappers
function mapMembroFromRow(row: any): MembroCelula {
  return {
    id: row.id,
    celulaId: row.celula_id,
    nome: row.nome,
    dataAniversario: row.data_aniversario || '',
    endereco: row.endereco || '',
    whatsapp: row.whatsapp || '',
    ativo: row.ativo ?? true,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function mapMembroToRow(data: Partial<MembroCelula>) {
  const row: Record<string, any> = {};
  if (data.celulaId !== undefined) row.celula_id = data.celulaId;
  if (data.nome !== undefined) row.nome = data.nome;
  if (data.dataAniversario !== undefined) row.data_aniversario = data.dataAniversario;
  if (data.endereco !== undefined) row.endereco = data.endereco;
  if (data.whatsapp !== undefined) row.whatsapp = data.whatsapp;
  if (data.ativo !== undefined) row.ativo = data.ativo;
  return row;
}

function mapChamadaFromRow(row: any): ChamadaCelula {
  return {
    id: row.id,
    celulaId: row.celula_id,
    dataEncontro: row.data_encontro,
    tema: row.tema || '',
    observacoes: row.observacoes || '',
    presencas: Array.isArray(row.presencas) ? row.presencas : [],
    visitantes: Array.isArray(row.visitantes) ? row.visitantes : [],
    totalPresentes: row.total_presentes || 0,
    totalFaltas: row.total_faltas || 0,
    totalVisitantes: row.total_visitantes || 0,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function mapChamadaToRow(data: Partial<ChamadaCelula>) {
  const row: Record<string, any> = {};
  if (data.celulaId !== undefined) row.celula_id = data.celulaId;
  if (data.dataEncontro !== undefined) row.data_encontro = data.dataEncontro;
  if (data.tema !== undefined) row.tema = data.tema;
  if (data.observacoes !== undefined) row.observacoes = data.observacoes;
  if (data.presencas !== undefined) row.presencas = data.presencas;
  if (data.visitantes !== undefined) row.visitantes = data.visitantes;
  if (data.totalPresentes !== undefined) row.total_presentes = data.totalPresentes;
  if (data.totalFaltas !== undefined) row.total_faltas = data.totalFaltas;
  if (data.totalVisitantes !== undefined) row.total_visitantes = data.totalVisitantes;
  return row;
}

// ==========================================
// SERVIÇOS DE MEMBROS
// ==========================================

export async function fetchMembrosPorCelula(celulaId: string): Promise<MembroCelula[]> {
  try {
    const { data, error } = await supabase
      .from(TABELA_MEMBROS)
      .select('*')
      .eq('celula_id', celulaId)
      .order('nome', { ascending: true });

    if (error) {
      console.warn('Supabase membros_celula aviso (usando fallback local):', error.message);
      return getLocalMembros(celulaId);
    }

    if (data) {
      const list = data.map(mapMembroFromRow);
      // Sincroniza localmente
      const allOther = getLocalMembros().filter(m => m.celulaId !== celulaId);
      saveLocalMembros([...allOther, ...list]);
      return list;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao Supabase para membros:', err);
  }
  return getLocalMembros(celulaId);
}

export async function criarMembro(membro: Omit<MembroCelula, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<MembroCelula> {
  const localId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'mem_' + Date.now();
  const novoMembroLocal: MembroCelula = {
    ...membro,
    id: localId,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  try {
    const row = mapMembroToRow(membro);
    const { data, error } = await supabase
      .from(TABELA_MEMBROS)
      .insert([row])
      .select()
      .single();

    if (!error && data) {
      const saved = mapMembroFromRow(data);
      const all = getLocalMembros();
      saveLocalMembros([...all.filter(m => m.id !== saved.id), saved]);
      return saved;
    }
  } catch (err) {
    console.warn('Falha no Supabase ao criar membro, salvando local:', err);
  }

  // Fallback local
  const all = getLocalMembros();
  saveLocalMembros([...all, novoMembroLocal]);
  return novoMembroLocal;
}

export async function atualizarMembro(id: string, updates: Partial<MembroCelula>): Promise<void> {
  try {
    const row = mapMembroToRow(updates);
    const { error } = await supabase
      .from(TABELA_MEMBROS)
      .update(row)
      .eq('id', id);

    if (error) {
      console.warn('Falha no update do Supabase (atualizando local):', error.message);
    }
  } catch (err) {
    console.warn('Erro ao atualizar membro no Supabase:', err);
  }

  // Atualiza localmente
  const all = getLocalMembros();
  const updated = all.map(m => m.id === id ? { ...m, ...updates, atualizadoEm: new Date().toISOString() } : m);
  saveLocalMembros(updated);
}

export async function excluirMembro(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABELA_MEMBROS)
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Falha no delete do Supabase (deletando local):', error.message);
    }
  } catch (err) {
    console.warn('Erro ao excluir membro no Supabase:', err);
  }

  // Remove local
  const all = getLocalMembros();
  saveLocalMembros(all.filter(m => m.id !== id));
}

// ==========================================
// SERVIÇOS DE CHAMADA
// ==========================================

export async function fetchChamadasPorCelula(celulaId: string): Promise<ChamadaCelula[]> {
  try {
    const { data, error } = await supabase
      .from(TABELA_CHAMADAS)
      .select('*')
      .eq('celula_id', celulaId)
      .order('data_encontro', { ascending: false });

    if (error) {
      console.warn('Supabase chamadas_celula aviso (usando fallback local):', error.message);
      return getLocalChamadas(celulaId);
    }

    if (data) {
      const list = data.map(mapChamadaFromRow);
      const allOther = getLocalChamadas().filter(c => c.celulaId !== celulaId);
      saveLocalChamadas([...allOther, ...list]);
      return list;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao Supabase para chamadas:', err);
  }
  return getLocalChamadas(celulaId);
}

export async function salvarChamada(chamada: Omit<ChamadaCelula, 'id' | 'criadoEm' | 'atualizadoEm'> & { id?: string }): Promise<ChamadaCelula> {
  const id = chamada.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'cha_' + Date.now());
  const chamadaObj: ChamadaCelula = {
    ...chamada,
    id,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  try {
    const row = mapChamadaToRow(chamada);
    let query;
    if (chamada.id) {
      query = supabase.from(TABELA_CHAMADAS).update(row).eq('id', chamada.id).select().single();
    } else {
      query = supabase.from(TABELA_CHAMADAS).insert([row]).select().single();
    }

    const { data, error } = await query;
    if (!error && data) {
      const saved = mapChamadaFromRow(data);
      const all = getLocalChamadas();
      saveLocalChamadas([...all.filter(c => c.id !== saved.id), saved]);
      return saved;
    }
  } catch (err) {
    console.warn('Falha no Supabase ao salvar chamada, salvando local:', err);
  }

  // Fallback local
  const all = getLocalChamadas();
  saveLocalChamadas([...all.filter(c => c.id !== id), chamadaObj]);
  return chamadaObj;
}

export async function excluirChamada(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABELA_CHAMADAS)
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('Falha no delete de chamada no Supabase:', error.message);
    }
  } catch (err) {
    console.warn('Erro ao excluir chamada no Supabase:', err);
  }

  const all = getLocalChamadas();
  saveLocalChamadas(all.filter(c => c.id !== id));
}
