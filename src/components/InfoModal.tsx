import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Users, MapPin, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-10 border border-slate-100 max-h-[90dvh] overflow-y-auto no-scrollbar"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 fill-brand-500 text-brand-500" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            O que é uma Célula?
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
            Uma célula é um pequeno grupo de amigos e famílias que se reúne semanalmente nos lares em <strong>Timóteo - MG</strong> para compartilhar a vida, estudar a Bíblia e orar uns pelos outros.
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Users className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-xs font-bold text-slate-800 block">Comunhão & Amizade</strong>
                <span className="text-[11px] text-slate-500">Ambiente acolhedor onde todo mundo é bem-vindo e cuidado de perto.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-xs font-bold text-slate-800 block">Perfis Variados</strong>
                <span className="text-[11px] text-slate-500">Temos células para Jovens, Casais, Famílias, Homens, Mulheres e Teens.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-xs font-bold text-slate-800 block">Perto de Você</strong>
                <span className="text-[11px] text-slate-500">Use o mapa interativo ou os filtros para achar a mais próxima da sua casa.</span>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 active:scale-95 transition-all"
            >
              Entendido, quero encontrar!
            </button>

            <div className="text-center pt-1">
              <a
                href="/lider/login"
                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                Área de Líderes e Administração →
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
