export type PerfilCelula = 
  | 'Todos'
  | 'Jovens'
  | 'Casais'
  | 'Família'
  | 'Homens'
  | 'Mulheres'
  | 'Teens'
  | 'Misto';

export type DiaSemana = 
  | 'Todos'
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado'
  | 'Domingo';

export interface Coords {
  lat: number;
  lng: number;
}

export interface EncontroAtual {
  dia: DiaSemana | string;
  horario: string;
  cep: string;
  endereco?: string;
  bairro: string;
  pontoReferencia?: string;
  coords: Coords;
  dataReferencia: string; // ISO date "YYYY-MM-DD" do encontro
  observacao?: string;
}

export interface Celula {
  id: string;
  nome: string;
  perfil: 'Jovens' | 'Casais' | 'Família' | 'Homens' | 'Mulheres' | 'Teens' | 'Misto';
  lider: string;
  telefone: string;
  fotoLider?: string;
  descricao?: string;
  faixaEtaria?: string;
  ativo: boolean;

  // Controle de tipo
  itinerante: boolean;

  // Dados para CÉLULA FIXA (itinerante: false)
  dia?: string;
  horario?: string;
  cep?: string;
  endereco?: string;
  bairro?: string;
  pontoReferencia?: string;
  coords?: Coords;

  // Dados para CÉLULA ITINERANTE (itinerante: true)
  // O líder atualiza "encontroAtual" toda semana
  encontroAtual?: EncontroAtual;

  // Metadados
  liderUid?: string;       // UID do usuário Firebase do líder
  liderEmail?: string;     // E-mail do líder
  criadoEm?: string;
  atualizadoEm?: string;
  distanciaKm?: number;    // Calculado em runtime
}

export interface BairroTimoteo {
  nome: string;
  cepPadrao: string;
  coords: Coords;
}

export interface UserLocation {
  coords: Coords;
  accuracy?: number;
  loading: boolean;
  error?: string | null;
}

export interface LiderUser {
  id?: string;
  uid?: string;
  userId?: string;
  email: string;
  nome: string;
  isAdmin: boolean;
  celulaId?: string;
  criadoEm?: string;
}
