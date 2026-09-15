import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { BAIRROS_TIMOTEO } from '../data/bairrosTimoteo';
import type { BairroTimoteo } from '../types/celula';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectBairro: (bairro: BairroTimoteo) => void;
  onClearSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSelectBairro,
  onClearSearch,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtro de sugestões de bairros
  const suggestedBairros = searchTerm.trim().length >= 1
    ? BAIRROS_TIMOTEO.filter(b =>
        b.nome.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md md:max-w-2xl mx-auto px-4 z-20" ref={dropdownRef}>
      <div
        className={`relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-floating transition-all duration-200 border ${
          isFocused ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-brand-500/10' : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="pl-3.5 pr-2 text-slate-400">
          <Search className="w-5 h-5 text-slate-400" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar por bairro em Timóteo (ex: Centro, Ana Rita)..."
          className="w-full py-3.5 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              onClearSearch();
            }}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Autocomplete de Bairros de Timóteo */}
      {isFocused && suggestedBairros.length > 0 && (
        <div className="absolute left-4 right-4 mt-2 py-2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-100 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Bairros em Timóteo
          </div>
          {suggestedBairros.map(bairro => (
            <button
              key={bairro.nome}
              type="button"
              onClick={() => {
                onSelectBairro(bairro);
                setIsFocused(false);
              }}
              className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-brand-50/70 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-brand-100 text-slate-500 group-hover:text-brand-600 flex items-center justify-center transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-brand-700">
                    {bairro.nome}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Timóteo - MG
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-brand-600 bg-slate-100 group-hover:bg-brand-100 px-2 py-0.5 rounded-md">
                Ver no mapa
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
