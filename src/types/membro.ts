export interface MembroCelula {
  id: string;
  celulaId: string;
  nome: string;
  dataAniversario: string; // Ex: "15/05" ou "1995-05-15"
  endereco: string;
  whatsapp: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type PontualidadeMinutos = 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60;

export interface PresencaMembro {
  membroId: string;
  nome: string;
  whatsapp?: string;
  presente: boolean;
  pontualidadeMinutos: PontualidadeMinutos;
  observacao?: string;
}

export interface VisitanteChamada {
  id: string;
  nome: string;
  whatsapp: string;
  convidadoPorMembroId?: string;
  convidadoPorNome?: string;
  pontualidadeMinutos: PontualidadeMinutos;
  observacao?: string;
}

export interface ChamadaCelula {
  id: string;
  celulaId: string;
  dataEncontro: string; // "YYYY-MM-DD"
  tema?: string;
  observacoes?: string;
  presencas: PresencaMembro[];
  visitantes: VisitanteChamada[];
  totalPresentes: number;
  totalFaltas: number;
  totalVisitantes: number;
  criadoEm?: string;
  atualizadoEm?: string;
}

export const OPCOES_PONTUALIDADE: { valor: PontualidadeMinutos; label: string; badgeColor: string }[] = [
  { valor: 0, label: 'Pontual (No horário)', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { valor: 5, label: '+5 min de atraso', badgeColor: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  { valor: 10, label: '+10 min de atraso', badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { valor: 15, label: '+15 min de atraso', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { valor: 20, label: '+20 min de atraso', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { valor: 25, label: '+25 min de atraso', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { valor: 30, label: '+30 min de atraso', badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { valor: 35, label: '+35 min de atraso', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { valor: 40, label: '+40 min de atraso', badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { valor: 45, label: '+45 min de atraso', badgeColor: 'bg-rose-600/20 text-rose-400 border-rose-600/30' },
  { valor: 50, label: '+50 min de atraso', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { valor: 55, label: '+55 min de atraso', badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { valor: 60, label: '+60 min ou mais', badgeColor: 'bg-red-600/20 text-red-400 border-red-600/30' },
];
