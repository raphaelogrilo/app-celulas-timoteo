import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Celula } from '../types/celula';
import {
  X,
  MessageCircle,
  Navigation,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Compass,
  Share2,
  Check,
} from 'lucide-react';
import {
  getWhatsAppLink,
  getGoogleMapsRouteLink,
  getWazeRouteLink,
  getTelLink,
  getProfileStyle,
} from '../utils/geo';

interface BottomSheetProps {
  celula: Celula | null;
  onClose: () => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  celula,
  onClose,
}) => {
  const [showNavOptions, setShowNavOptions] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!celula) return null;

  const style = getProfileStyle(celula.perfil);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) {
      onClose();
    }
  };

  const handleShare = async () => {
    const text = `Venha participar da *${celula.nome}* (${celula.perfil}) em Timóteo! Toda ${celula.dia} às ${celula.horario}. Líder: ${celula.lider}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: celula.nome,
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-end md:justify-center md:items-center md:p-4">
        {/* Backdrop suave */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal Deslizante no Mobile / Dialog Centralizado no Desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.6 }}
          onDragEnd={handleDragEnd}
          className="relative w-full max-w-lg md:max-w-md mx-auto bg-white rounded-t-[32px] md:rounded-[32px] shadow-2xl pointer-events-auto max-h-[85dvh] flex flex-col border-t md:border border-slate-100 overflow-hidden"
        >
          {/* Handle de Arrasto (somente mobile) */}
          <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing md:hidden">
            <div className="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>

          <div className="px-5 pt-3 md:pt-5 pb-6 overflow-y-auto no-scrollbar space-y-4">
            {/* Header: Nome, Bairro e Botões de Topo */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${style.badgeBg} ${style.badgeText} shadow-sm`}>
                    {celula.perfil}
                  </span>
                  {celula.distanciaKm !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      📍 a {celula.distanciaKm} km de você
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {celula.nome}
                </h2>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  Bairro {celula.bairro}, Timóteo - MG
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Compartilhar célula"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar modal"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cartão de Dia e Horário em Destaque */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50 via-slate-50 to-indigo-50 border border-brand-100/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                    Dia do Encontro
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">
                    Toda {celula.dia}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-200/80 text-xs font-bold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                {celula.horario}
              </div>
            </div>

            {/* Seção do Líder */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {celula.fotoLider ? (
                  <img
                    src={celula.fotoLider}
                    alt={celula.lider}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                    {celula.lider.charAt(0)}
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Liderança da Célula
                  </span>
                  <div className="text-sm font-bold text-slate-800">
                    {celula.lider}
                  </div>
                </div>
              </div>

              <a
                href={getTelLink(celula)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                title="Ligar para o líder"
              >
                <Phone className="w-4 h-4 text-slate-600" />
              </a>
            </div>

            {/* Informações de Localização e Privacidade */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-800 block text-xs font-bold">Localização:</strong>
                  <span className="text-slate-700">
                    Bairro {celula.itinerante ? celula.encontroAtual?.bairro : celula.bairro}, Timóteo - MG
                    { (celula.itinerante ? celula.encontroAtual?.cep : celula.cep) && (
                      <span className="text-slate-500 block text-[11px] mt-0.5">
                        Região do CEP: {celula.itinerante ? celula.encontroAtual?.cep : celula.cep}
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 leading-tight">
                <span className="font-bold flex-shrink-0">🔒 Privacidade:</span>
                <span>Por segurança das famílias, o endereço exato da casa é informado diretamente pelo líder no WhatsApp.</span>
              </div>
            </div>

            {/* Descrição / Faixa Etária */}
            {celula.descricao && (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                "{celula.descricao}"
              </p>
            )}

            {/* Ações Principais (Thumb Zone - CTAs) */}
            <div className="pt-2 space-y-2.5 pb-[calc(var(--sab)+6px)]">
              {/* Botão Primário: Falar no WhatsApp */}
              <a
                href={getWhatsAppLink(celula)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Falar com o Líder no WhatsApp</span>
              </a>

              {/* Botões Secundários: Como Chegar e Ligar */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNavOptions(!showNavOptions)}
                    className="w-full py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-soft active:scale-[0.98] transition-all"
                  >
                    <Navigation className="w-4 h-4 text-brand-400" />
                    <span>Como Chegar</span>
                  </button>

                  {/* Dropdown de aplicativos de navegação */}
                  {showNavOptions && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-slate-900 rounded-2xl shadow-xl border border-slate-700 space-y-1 z-30 animate-in fade-in slide-in-from-bottom-2">
                      <a
                        href={getGoogleMapsRouteLink(celula)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
                      >
                        <Compass className="w-4 h-4 text-red-400" />
                        Google Maps
                      </a>
                      <a
                        href={getWazeRouteLink(celula)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
                      >
                        <Navigation className="w-4 h-4 text-cyan-400" />
                        Waze
                      </a>
                    </div>
                  )}
                </div>

                <a
                  href={getTelLink(celula)}
                  className="w-full py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-200/80 active:scale-[0.98] transition-all"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Ligar Direto</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
