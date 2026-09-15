import React from 'react';
import { MapPin, Info, Loader2 } from 'lucide-react';
import { AtosLogo } from './AtosLogo';

interface HeaderProps {
  totalCelulas: number;
  filteredCount: number;
  onOpenInfo: () => void;
  loading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalCelulas,
  filteredCount,
  onOpenInfo,
  loading = false,
}) => {
  return (
    <header className="relative z-30 pt-[calc(var(--sat)+10px)] pb-2.5 px-4 bg-gradient-to-b from-slate-950/95 via-slate-900/85 to-transparent backdrop-blur-md">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo da Igreja Atos & Cidade */}
        <div className="flex items-center gap-2.5">
          <AtosLogo size="md" showText={true} textColor="white" />
          <div className="border-l border-white/20 pl-2.5 ml-0.5">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold tracking-tight text-white flex items-center gap-1">
                Células <span className="text-[#FAAB36] font-extrabold">Timóteo</span>
              </h1>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FAAB36]/20 text-[#FAAB36] border border-[#FAAB36]/30">
                MG
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium flex items-center gap-1">
              {loading ? (
                <Loader2 className="w-3 h-3 text-brand-400 animate-spin" />
              ) : (
                <MapPin className="w-3 h-3 text-brand-400" />
              )}
              {loading ? (
                <span>Carregando células...</span>
              ) : filteredCount === totalCelulas ? (
                <span>{totalCelulas} células ativas na cidade</span>
              ) : (
                <span>
                  <strong className="text-white">{filteredCount}</strong> de {totalCelulas} células encontradas
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Botão de Ajuda / Info */}
        <button
          onClick={onOpenInfo}
          type="button"
          aria-label="Sobre o app de células"
          className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors active:scale-95 shadow-soft"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
