import React from 'react';
import type { PerfilCelula, DiaSemana } from '../types/celula';
import { Users, Calendar, Sparkles, X } from 'lucide-react';

interface FilterChipsProps {
  selectedPerfil: PerfilCelula;
  onSelectPerfil: (perfil: PerfilCelula) => void;
  selectedDia: DiaSemana;
  onSelectDia: (dia: DiaSemana) => void;
  onResetFilters: () => void;
}

const PERFIS: { label: PerfilCelula; icon?: string; color: string }[] = [
  { label: 'Todos', color: 'bg-slate-800 text-white' },
  { label: 'Homens', color: 'bg-[#3E1F11] text-white' },
  { label: 'Mulheres', color: 'bg-[#B14468] text-white' },
  { label: 'Casais', color: 'bg-[#C69248] text-slate-950 font-extrabold' },
  { label: 'Jovens', color: 'bg-[#CB3F1C] text-white' },
  { label: 'Adolescentes', color: 'bg-[#8C111D] text-white' },
];

const DIAS: { label: DiaSemana; short: string }[] = [
  { label: 'Todos', short: 'Todos os dias' },
  { label: 'Quarta-feira', short: 'Quarta' },
  { label: 'Quinta-feira', short: 'Quinta' },
  { label: 'Sexta-feira', short: 'Sexta' },
  { label: 'Sábado', short: 'Sábado' },
  { label: 'Segunda-feira', short: 'Segunda' },
  { label: 'Terça-feira', short: 'Terça' },
  { label: 'Domingo', short: 'Domingo' },
];

export const FilterChips: React.FC<FilterChipsProps> = ({
  selectedPerfil,
  onSelectPerfil,
  selectedDia,
  onSelectDia,
  onResetFilters,
}) => {
  const hasActiveFilter = selectedPerfil !== 'Todos' || selectedDia !== 'Todos';

  return (
    <div className="w-full relative z-20 pt-2 pb-1.5 px-4 space-y-2 max-w-md md:max-w-3xl mx-auto">
      {/* Linha 1: Perfis (Chips deslizantes) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 md:justify-center">
        {hasActiveFilter && (
          <button
            onClick={onResetFilters}
            type="button"
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200/80 shadow-sm active:scale-95 transition-transform"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}

        {PERFIS.map((item) => {
          const isSelected = selectedPerfil === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectPerfil(item.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? `${item.color} shadow-md shadow-slate-900/20 ring-2 ring-white/50`
                  : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200/90 shadow-sm'
              }`}
            >
              {item.label === 'Todos' ? (
                <Sparkles className="w-3.5 h-3.5" />
              ) : (
                <Users className="w-3.5 h-3.5 opacity-70" />
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Linha 2: Dias da Semana */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
        {DIAS.map((item) => {
          const isSelected = selectedDia === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectDia(item.label)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200/70'
              }`}
            >
              <Calendar className="w-3 h-3 opacity-60" />
              {item.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};
