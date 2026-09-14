import React from 'react';
import type { Celula } from '../types/celula';
import { getProfileStyle, getWhatsAppLink } from '../utils/geo';
import {
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  ChevronRight,
  SearchX,
} from 'lucide-react';

interface ListViewProps {
  celulas: Celula[];
  onSelectCelula: (celula: Celula) => void;
  onResetFilters: () => void;
}

export const ListView: React.FC<ListViewProps> = ({
  celulas,
  onSelectCelula,
  onResetFilters,
}) => {
  if (celulas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-900/60 backdrop-blur-md">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-xl">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          Nenhuma célula encontrada
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mb-5">
          Não encontramos células com os filtros atuais em Timóteo. Tente alterar o bairro, dia ou perfil.
        </p>
        <button
          onClick={onResetFilters}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/25 transition-all active:scale-95"
        >
          Limpar Filtros e Ver Todas
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 max-w-md mx-auto w-full no-scrollbar pb-[calc(var(--sab)+80px)]">
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
        <span>Mostrando {celulas.length} células em Timóteo</span>
        <span>Toque para detalhes</span>
      </div>

      {celulas.map((celula) => {
        const style = getProfileStyle(celula.perfil);

        return (
          <div
            key={celula.id}
            onClick={() => onSelectCelula(celula)}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-md border border-slate-100 hover:border-brand-300 transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${style.badgeBg} ${style.badgeText}`}
                  >
                    {celula.perfil}
                  </span>
                  {celula.distanciaKm !== undefined && (
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                      📍 {celula.distanciaKm} km
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {celula.nome}
                </h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  Bairro {celula.bairro}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Informações de Encontro */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Toda {celula.dia}</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{celula.horario}</span>
              </div>
            </div>

            {/* Líder & Botão WhatsApp Rápido */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {celula.fotoLider ? (
                  <img
                    src={celula.fotoLider}
                    alt={celula.lider}
                    className="w-6 h-6 rounded-full object-cover border border-white shadow-xs"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    {celula.lider.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-medium text-slate-600 truncate max-w-[140px]">
                  Líder: {celula.lider}
                </span>
              </div>

              <a
                href={getWhatsAppLink(celula)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200/80 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
