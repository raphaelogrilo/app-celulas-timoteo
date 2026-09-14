import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2, Navigation } from 'lucide-react';
import { BAIRROS_TIMOTEO } from '../data/bairrosTimoteo';
import { fetchCepData } from '../utils/geo';
import type { BairroTimoteo } from '../types/celula';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelectBairro: (bairro: BairroTimoteo) => void;
  onClearSearch: () => void;
  isLoadingCep?: boolean;
  setIsLoadingCep?: (loading: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onSelectBairro,
  onClearSearch,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtro de sugestões de bairros
  const suggestedBairros = searchTerm.trim().length >= 1
    ? BAIRROS_TIMOTEO.filter(b =>
        b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.cepPadrao.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))
      )
    : [];

  // Formatação automática e busca de CEP
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Se o usuário estiver digitando apenas números, aplica máscara de CEP
    const numericOnly = value.replace(/\D/g, '');
    if (numericOnly.length > 0 && /^\d+$/.test(value.replace('-', ''))) {
      if (numericOnly.length <= 5) {
        value = numericOnly;
      } else {
        value = `${numericOnly.slice(0, 5)}-${numericOnly.slice(5, 8)}`;
      }
    }

    onSearchChange(value);
    setCepFeedback(null);

    // Se completou 8 dígitos de CEP, pesquisa na API ViaCEP
    if (numericOnly.length === 8) {
      setIsSearchingCep(true);
      try {
        const cepData = await fetchCepData(numericOnly);
        if (cepData && !cepData.erro && cepData.bairro) {
          const matchedBairro = BAIRROS_TIMOTEO.find(
            b => b.nome.toLowerCase() === (cepData.bairro || '').toLowerCase()
          );

          if (matchedBairro) {
            onSelectBairro(matchedBairro);
            setCepFeedback(`Bairro ${cepData.bairro} localizado!`);
          } else {
            setCepFeedback(`Localizado em ${cepData.bairro}, Timóteo`);
          }
        } else {
          setCepFeedback('CEP não localizado ou fora de Timóteo.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingCep(false);
      }
    }
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
    <div className="relative w-full max-w-md mx-auto px-4 z-20" ref={dropdownRef}>
      <div
        className={`relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-floating transition-all duration-200 border ${
          isFocused ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-brand-500/10' : 'border-slate-200/80 hover:border-slate-300'
        }`}
      >
        <div className="pl-3.5 pr-2 text-slate-400">
          {isSearchingCep ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          ) : (
            <Search className="w-5 h-5 text-slate-400" />
          )}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar por bairro (ex: Centro) ou CEP..."
          className="w-full py-3.5 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              onClearSearch();
              setCepFeedback(null);
            }}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Feedback de CEP */}
      {cepFeedback && (
        <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold flex items-center gap-1.5 border border-brand-200 animate-fadeIn">
          <Navigation className="w-3.5 h-3.5 text-brand-600" />
          {cepFeedback}
        </div>
      )}

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
              className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-brand-50/70 transition-colors group"
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
                    CEP: {bairro.cepPadrao}
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
