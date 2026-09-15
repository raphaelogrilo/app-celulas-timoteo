import type { Coords, Celula, PerfilCelula } from '../types/celula';
import { BAIRROS_TIMOTEO } from '../data/bairrosTimoteo';

/**
 * Calcula a distância em quilômetros entre duas coordenadas usando a fórmula de Haversine
 */
export function calculateDistanceKm(coord1: Coords, coord2: Coords): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Number(distance.toFixed(1));
}

/**
 * Busca dados de endereço pelo CEP na API do ViaCEP
 */
export async function fetchCepData(cepInput: string): Promise<{
  bairro?: string;
  logradouro?: string;
  localidade?: string;
  erro?: boolean;
} | null> {
  const cleanCep = cepInput.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.erro) return { erro: true };
    return {
      bairro: data.bairro,
      logradouro: data.logradouro,
      localidade: data.localidade
    };
  } catch (err) {
    console.error('Erro ao consultar ViaCEP:', err);
    return null;
  }
}

/**
 * Normaliza e formata um endereço digitado pelo usuário para o padrão Google Maps:
 * Ex: "r. oito de novembro, 5 - centro" -> "Rua Oito de Novembro, 5"
 * Ex: "av. castelo branco 300" -> "Avenida Castelo Branco, 300"
 * Ex: "rua 31 de marco 240" -> "Rua 31 de Março, 240"
 */
export function formatGoogleMapsAddress(rawAddress: string): string {
  if (!rawAddress) return '';
  let str = rawAddress.trim();

  // Remove sufixos como "- Centro", "- Timóteo", etc se o usuário colou tudo junto no campo
  str = str.replace(/\s*[-–—]\s*(Centro|Timóteo|MG|Minas Gerais|Bairro\s+.*|Brasil).*/i, '');

  // Identifica e expande prefixos de logradouros
  const prefixes: [RegExp, string][] = [
    [/^(r\.|r\s+|rua\s+)/i, 'Rua '],
    [/^(av\.|av\s+|ave\.|avenida\s+)/i, 'Avenida '],
    [/^(al\.|al\s+|alameda\s+)/i, 'Alameda '],
    [/^(tr\.|tr\s+|trav\.|trav\s+|travessa\s+)/i, 'Travessa '],
    [/^(pr\.|pr\s+|pca\.|pça\.|pça\s+|praça\s+|praca\s+)/i, 'Praça '],
    [/^(rod\.|rod\s+|rodovia\s+)/i, 'Rodovia '],
    [/^(est\.|est\s+|estrada\s+)/i, 'Estrada '],
    [/^(bc\.|bc\s+|beco\s+)/i, 'Beco '],
    [/^(vl\.|vl\s+|viela\s+)/i, 'Viela '],
  ];

  let prefix = '';
  let rest = str;

  for (const [regex, standardPrefix] of prefixes) {
    if (regex.test(str)) {
      prefix = standardPrefix;
      rest = str.replace(regex, '').trim();
      break;
    }
  }

  // Se não começou com nenhum prefixo conhecido
  if (!prefix) {
    prefix = 'Rua ';
  }

  // Ajusta número (ex: "Rua Oito de Novembro 5" -> "Rua Oito de Novembro, 5")
  rest = rest.replace(/\s*(?:nº|n°|n\.|n|num\.|num|número)\s*(\d+[a-zA-Z]?)/i, ', $1');
  
  // Se ainda tem espaço seguido de dígitos no fim sem vírgula (ex: "Oito de Novembro 5")
  if (!rest.includes(',') && /\s+(\d+[a-zA-Z]?)$/.test(rest)) {
    rest = rest.replace(/\s+(\d+[a-zA-Z]?)$/, ', $1');
  }

  // Separa logradouro do número para formatar em Title Case
  let [logradouro, numero] = rest.split(',').map(s => s.trim());

  const lowercaseWords = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'com', 'no', 'na', 'nos', 'nas', 'del']);

  if (logradouro) {
    logradouro = logradouro
      .split(/\s+/)
      .map((word, index) => {
        const lower = word.toLowerCase();
        // Preserva números ordinais (1º, 2ª, 31)
        if (/^\d+[ºª°]?$/i.test(word)) return word;
        if (index > 0 && lowercaseWords.has(lower)) return lower;
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  }

  let formatted = `${prefix}${logradouro}`;
  if (numero) {
    formatted += `, ${numero}`;
  }

  return formatted;
}

/**
 * Converte um endereço completo (Rua, Número, Bairro, CEP, Cidade) em coordenadas geográficas precisas (Lat, Lng)
 * utilizando o serviço de geocodificação do OpenStreetMap (Nominatim) com fallback inteligente por bairro.
 */
export async function geocodeAddress(
  enderecoCompleto?: string,
  bairro?: string,
  cep?: string,
  cidade: string = 'Timóteo',
  estado: string = 'MG'
): Promise<Coords | null> {
  // 1. Tenta consulta direta com endereço completo + bairro + cidade
  const queryParts = [];
  if (enderecoCompleto && enderecoCompleto.trim()) {
    queryParts.push(enderecoCompleto.trim());
  }
  if (bairro && bairro.trim()) {
    queryParts.push(bairro.trim());
  }
  queryParts.push(cidade);
  queryParts.push(estado);
  if (cep && cep.trim()) {
    queryParts.push(cep.trim());
  }
  queryParts.push('Brasil');

  const fullQuery = queryParts.join(', ');

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(fullQuery)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'pt-BR',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    }
  } catch (err) {
    console.warn('Geocodificação de endereço detalhado falhou, tentando fallback:', err);
  }

  // 2. Se falhar e tiver apenas rua/logradouro (sem o número), tenta buscar o logradouro no bairro
  if (enderecoCompleto && enderecoCompleto.includes(',')) {
    const logradouro = enderecoCompleto.split(',')[0].trim();
    try {
      const streetQuery = `${logradouro}, ${bairro || ''}, ${cidade}, ${estado}, Brasil`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(streetQuery)}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'pt-BR' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }
      }
    } catch {
      // continua para fallback
    }
  }

  // 3. Fallback: Coordenadas do Bairro cadastrado
  if (bairro) {
    const cleanBairro = bairro.toLowerCase().trim();
    const found = BAIRROS_TIMOTEO.find(
      b => b.nome.toLowerCase().trim() === cleanBairro || cleanBairro.includes(b.nome.toLowerCase().trim())
    );
    if (found) {
      return found.coords;
    }
  }

  return null;
}

/**
 * Gera link de conversa no WhatsApp com mensagem preenchida
 */
export function getWhatsAppLink(celula: Celula): string {
  const cleanPhone = celula.telefone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
  
  const dia = celula.itinerante ? celula.encontroAtual?.dia : celula.dia;
  const horario = celula.itinerante ? celula.encontroAtual?.horario : celula.horario;
  const bairro = celula.itinerante ? celula.encontroAtual?.bairro : celula.bairro;

  const message = `Olá líder ${celula.lider}! 👋\nVi a *${celula.nome}* (${bairro}) no app de células de Timóteo e gostaria de participar do próximo encontro (${dia || 'desta semana'} às ${horario || '19h30'}). Poderia me passar o endereço exato para eu ir?`;
  
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

/**
 * Gera link para rotas no Google Maps
 */
export function getGoogleMapsRouteLink(celula: Celula): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${celula.coords?.lat ?? 0},${celula.coords?.lng ?? 0}&destination_place_id=Timoteo`;
}

/**
 * Gera link para navegação no Waze
 */
export function getWazeRouteLink(celula: Celula): string {
  return `https://waze.com/ul?ll=${celula.coords?.lat ?? 0},${celula.coords?.lng ?? 0}&navigate=yes`;
}

/**
 * Gera link de ligação telefônica direta
 */
export function getTelLink(celula: Celula): string {
  const cleanPhone = celula.telefone.replace(/\D/g, '');
  return `tel:+55${cleanPhone}`;
}

/**
 * Configurações de estilo e cores por perfil de célula
 */
export interface ProfileStyle {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  badgeText: string;
  markerColor: string;
  pinBg: string;
}

export function getProfileStyle(perfil: PerfilCelula | string): ProfileStyle {
  switch (perfil) {
    case 'Jovens':
      return {
        bg: 'bg-[#FFF5ED]',
        border: 'border-[#FED7AA]',
        text: 'text-[#C2410C]',
        badgeBg: 'bg-[#FA6400]',
        badgeText: 'text-white font-extrabold',
        markerColor: '#FA6400',
        pinBg: '#FA6400',
      };
    case 'Casais':
      return {
        bg: 'bg-[#FFF8F2]',
        border: 'border-[#FED7AA]',
        text: 'text-[#B45309]',
        badgeBg: 'bg-[#F89E50]',
        badgeText: 'text-white font-extrabold',
        markerColor: '#F89E50',
        pinBg: '#F89E50',
      };
    case 'Família':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        badgeBg: 'bg-blue-600',
        badgeText: 'text-white',
        markerColor: '#2563eb',
        pinBg: '#2563eb',
      };
    case 'Mulheres':
      return {
        bg: 'bg-[#FDF2F4]',
        border: 'border-[#E8BAC7]',
        text: 'text-[#9B3D55]',
        badgeBg: 'bg-[#B75D74]',
        badgeText: 'text-white',
        markerColor: '#B75D74',
        pinBg: '#B75D74',
      };
    case 'Homens':
      return {
        bg: 'bg-[#F7F3EE]',
        border: 'border-[#D7CCC8]',
        text: 'text-[#5D4037]',
        badgeBg: 'bg-[#6D4C41]',
        badgeText: 'text-white font-extrabold',
        markerColor: '#6D4C41',
        pinBg: '#6D4C41',
      };
    case 'Teens':
      return {
        bg: 'bg-[#FEF2F2]',
        border: 'border-[#FECACA]',
        text: 'text-[#DC2626]',
        badgeBg: 'bg-[#E62129]',
        badgeText: 'text-white font-extrabold',
        markerColor: '#E62129',
        pinBg: '#E62129',
      };
    default:
      return {
        bg: 'bg-slate-100',
        border: 'border-slate-300',
        text: 'text-slate-800',
        badgeBg: 'bg-slate-700',
        badgeText: 'text-white',
        markerColor: '#334155',
        pinBg: '#334155',
      };
  }
}
