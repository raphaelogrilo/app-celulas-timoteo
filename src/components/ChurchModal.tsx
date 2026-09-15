import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Calendar, MapPin, Compass, MessageCircle, Share2, Check } from 'lucide-react';
import { IGREJA_ATOS_SEDE } from '../data/bairrosTimoteo';
import { AtosLogo } from './AtosLogo';

interface ChurchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChurchModal: React.FC<ChurchModalProps> = ({ isOpen, onClose }) => {
  const [showNavOptions, setShowNavOptions] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${IGREJA_ATOS_SEDE.coords.lat},${IGREJA_ATOS_SEDE.coords.lng}&destination_place_id=Igreja+Atos+Timoteo`;
  const wazeUrl = `https://waze.com/ul?ll=${IGREJA_ATOS_SEDE.coords.lat},${IGREJA_ATOS_SEDE.coords.lng}&navigate=yes`;
  const whatsAppUrl = `https://wa.me/5531998711000?text=${encodeURIComponent('Olá! Gostaria de informações sobre os cultos e atividades da Igreja Atos em Timóteo.')}`;

  const handleShare = async () => {
    const text = `Venha conhecer a *Igreja Atos* em Timóteo!\n📍 ${IGREJA_ATOS_SEDE.enderecoCompleto}\n✨ Cultos: ${IGREJA_ATOS_SEDE.cultos}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Igreja Atos · Sede Timóteo',
          text,
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
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end md:justify-center md:items-center md:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal Sheet / Dialog Desktop */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-lg md:max-w-md mx-auto bg-white rounded-t-[32px] md:rounded-[32px] shadow-2xl pointer-events-auto max-h-[85dvh] flex flex-col border-t md:border border-amber-200 overflow-hidden"
        >
          {/* Handle (somente mobile) */}
          <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing md:hidden">
            <div className="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>

          <div className="px-5 pt-3 md:pt-5 pb-6 overflow-y-auto no-scrollbar space-y-4">
            {/* Header da Igreja */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-950 shadow-md">
                  <AtosLogo size="md" showText={false} />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-900 border border-amber-500/30 uppercase tracking-wider mb-1">
                    ⭐ Sede Oficial
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Igreja Atos
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Timóteo - MG
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horários de Culto */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    Cultos de Celebração
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                    {IGREJA_ATOS_SEDE.cultos}
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço Exato Marcado */}
            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-slate-900 block text-xs font-bold mb-0.5">
                    Endereço da Sede:
                  </strong>
                  <span className="text-slate-800 font-medium leading-relaxed">
                    {IGREJA_ATOS_SEDE.enderecoCompleto}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    Bairro {IGREJA_ATOS_SEDE.bairro} · CEP {IGREJA_ATOS_SEDE.cep}
                  </span>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-2 space-y-2.5 pb-[calc(var(--sab)+6px)]">
              {/* Botão Primário: Como Chegar na Igreja */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNavOptions(!showNavOptions)}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-all"
                >
                  <Navigation className="w-5 h-5 fill-slate-950 text-slate-950" />
                  <span>Como Chegar na Igreja (Rotas)</span>
                </button>

                {showNavOptions && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-slate-900 rounded-2xl shadow-xl border border-slate-700 space-y-1 z-30">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-red-400" />
                      Abrir no Google Maps
                    </a>
                    <a
                      href={wazeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 rounded-xl flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      Abrir no Waze
                    </a>
                  </div>
                )}
              </div>

              {/* Botão Secundário: WhatsApp */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Falar com a Secretaria no WhatsApp</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
