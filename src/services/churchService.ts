import { supabase } from '../lib/supabase';
import type { IgrejaSede } from '../types/celula';
import { IGREJA_ATOS_SEDE } from '../data/bairrosTimoteo';

const LOCAL_STORAGE_KEY = 'igreja_atos_sede_config';

export function getLocalIgrejaSede(): IgrejaSede {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Erro ao ler igreja sede local:', err);
  }
  return IGREJA_ATOS_SEDE;
}

export function saveLocalIgrejaSede(data: IgrejaSede): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('igreja_sede_updated', { detail: data }));
  } catch (err) {
    console.error('Erro ao salvar igreja sede local:', err);
  }
}

export async function fetchIgrejaSede(): Promise<IgrejaSede> {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('config_igreja')
        .select('*')
        .eq('id', 'sede_principal')
        .maybeSingle();

      if (!error && data) {
        const sede: IgrejaSede = {
          nome: data.nome || IGREJA_ATOS_SEDE.nome,
          endereco: data.endereco || IGREJA_ATOS_SEDE.endereco,
          enderecoCompleto: data.endereco_completo || IGREJA_ATOS_SEDE.enderecoCompleto,
          bairro: data.bairro || IGREJA_ATOS_SEDE.bairro,
          cep: data.cep || IGREJA_ATOS_SEDE.cep,
          cidade: data.cidade || IGREJA_ATOS_SEDE.cidade,
          coords: data.lat && data.lng ? { lat: Number(data.lat), lng: Number(data.lng) } : IGREJA_ATOS_SEDE.coords,
          cultos: data.cultos || IGREJA_ATOS_SEDE.cultos,
          telefone: data.telefone || IGREJA_ATOS_SEDE.telefone,
        };
        saveLocalIgrejaSede(sede);
        return sede;
      }
    }
  } catch (err) {
    console.warn('Supabase config_igreja fallback para localStorage:', err);
  }
  return getLocalIgrejaSede();
}

export async function saveIgrejaSede(sedeData: IgrejaSede): Promise<void> {
  saveLocalIgrejaSede(sedeData);
  try {
    if (supabase) {
      await supabase.from('config_igreja').upsert({
        id: 'sede_principal',
        nome: sedeData.nome,
        endereco: sedeData.endereco,
        endereco_completo: sedeData.enderecoCompleto,
        bairro: sedeData.bairro,
        cep: sedeData.cep,
        cidade: sedeData.cidade,
        lat: sedeData.coords.lat,
        lng: sedeData.coords.lng,
        cultos: sedeData.cultos,
        telefone: sedeData.telefone,
        atualizado_em: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Supabase config_igreja upsert não disponível, salvo em localStorage:', err);
  }
}
