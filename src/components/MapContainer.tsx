import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Celula, Coords, UserLocation } from '../types/celula';
import { TIMOTEO_CENTER } from '../data/bairrosTimoteo';
import { useIgrejaSede } from '../hooks/useIgrejaSede';
import { Locate, RotateCcw, List, Map as MapIcon, Loader2 } from 'lucide-react';

interface MapViewProps {
  celulas: Celula[];
  selectedCelula: Celula | null;
  onSelectCelula: (celula: Celula) => void;
  onOpenChurch?: () => void;
  userLocation: UserLocation;
  onRequestUserLocation: () => void;
  viewMode: 'map' | 'list';
  onToggleViewMode: () => void;
  targetCoords: Coords | null;
}

// Sub-componente para controlar movimentações da câmera do mapa
const MapController: React.FC<{
  targetCoords: Coords | null;
  selectedCelula: Celula | null;
}> = ({ targetCoords, selectedCelula }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedCelula) {
      const c = selectedCelula.itinerante
        ? selectedCelula.encontroAtual?.coords
        : selectedCelula.coords;
      if (c) map.flyTo([c.lat, c.lng], 16, { duration: 1.0, easeLinearity: 0.25 });
    } else if (targetCoords) {
      map.flyTo(
        [targetCoords.lat, targetCoords.lng],
        15,
        { duration: 1.0, easeLinearity: 0.25 }
      );
    }
  }, [targetCoords, selectedCelula, map]);

  return null;
};

// Gerador de ícone customizado SVG para a Sede da Igreja Atos (Marcador Amarelo / Ouro Compacto)
const createIgrejaSedePinIcon = () => {
  const html = `
    <div class="pin-container" style="cursor: pointer; z-index: 1000; position: relative;">
      <div style="
        display: flex;
        align-items: center;
        gap: 5px;
        background: linear-gradient(135deg, #FBBF24, #F59E0B);
        color: #0f172a;
        padding: 3.5px 9px;
        border-radius: 9999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 10.5px;
        font-weight: 800;
        box-shadow: 0 3px 12px rgba(245, 158, 11, 0.5), 0 2px 4px rgba(0,0,0,0.25);
        border: 2px solid #ffffff;
        white-space: nowrap;
        transform: scale(1.05);
      ">
        <svg style="width: 12px; height: 12px;" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="42" stroke="#0f172a" stroke-width="14"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M50 22L72 58L50 82L28 58L50 22ZM50 44L61 62H39L50 44Z" fill="#0f172a"/>
        </svg>
        <span style="letter-spacing: -0.01em;">Igreja Atos</span>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 6px solid #F59E0B;
        margin-top: -1px;
        margin-left: auto;
        margin-right: auto;
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-church-pin',
    html: html,
    iconSize: [95, 36],
    iconAnchor: [47, 36],
  });
};

// SVGs vetoriais embutidos diretamente para renderização 100% confiável e instantânea
const PINS_SVG_INLINE: Record<string, string> = {
  homens: `<svg viewBox="0 0 128.25 175.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#492b10" d="M68.48,153.99c-2.25,2.72-6.26,2.82-8.49.16-6.84-8.15-13.05-16.58-18.79-25.57-6.34-9.92-12.33-21.34-15.04-32.82-2.86-12.12,0-24.6,8.04-34.22,7.56-9.03,19.12-14.27,31.11-13.89,24.78.79,42.52,23.94,36.78,48.04-1.17,4.92-2.8,9.69-4.97,14.47-7.01,15.4-17.77,30.63-28.64,43.82Z"/><path fill="#a65c12" d="M71.33,85.64h-14.4c-1.66,0-3.01-1.35-3.01-3.01,0-.41.08-.81.23-1.17h0s.1-.21.1-.21l.03-.05,9.15-19.17.04-.08h0c.13-.24.38-.39.66-.39s.54.16.66.39l.03.07,9.15,19.18.02.04.1.2h0s0,.02,0,.02c.15.36.24.76.24,1.17,0,1.66-1.35,3.01-3.01,3.01M96.08,83.03l-.06-.13-31.2-63.03-.03-.07c-.13-.23-.38-.39-.66-.39s-.54.16-.66.39l-.03.07-31.2,63.03-.06.13c-.38.79-.59,1.68-.59,2.61,0,1.58.61,3.03,1.62,4.1l.11.12.04.03,30.21,31.6.05.05c.14.14.32.22.53.22s.39-.08.53-.22l.05-.05,16.2-16.94,14-14.64.05-.05v-.02s.06-.05.06-.05l.05-.05.05-.05c.97-1.07,1.56-2.49,1.56-4.05,0-.94-.21-1.82-.59-2.61"/></svg>`,
  
  mulheres: `<svg viewBox="0 0 128.25 175.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#602134" d="M68.48,154.09c-2.25,2.72-6.26,2.82-8.49.16-6.84-8.15-13.05-16.58-18.79-25.57-6.34-9.92-12.33-21.34-15.04-32.82-2.86-12.12,0-24.6,8.04-34.22,7.56-9.03,19.12-14.27,31.11-13.89,24.78.79,42.52,23.94,36.78,48.04-1.17,4.92-2.8,9.69-4.97,14.47-7.01,15.4-17.77,30.63-28.64,43.82Z"/><path fill="#c2637d" d="M56.99,55.1h14.27c1.65,0,2.98,1.33,2.98,2.98,0,.41-.08.8-.23,1.16h0s0,0,0,0l-.1.21-.03.05-9.06,18.99-.04.08h0c-.13.23-.37.39-.65.39s-.53-.16-.66-.39l-.03-.07-9.07-19-.02-.04-.1-.2h0s0-.02,0-.02c-.15-.36-.23-.75-.23-1.16,0-1.65,1.33-2.98,2.98-2.98M32.46,57.69l.06.13,30.91,62.45.03.07c.13.23.37.39.66.39s.53-.16.66-.39l.03-.07,30.91-62.45.06-.13c.38-.78.59-1.66.59-2.59,0-1.57-.61-3-1.6-4.06l-.11-.12-.04-.03-29.93-31.3-.05-.05c-.14-.14-.32-.22-.53-.22s-.39.08-.53.22l-.05.05-16.05,16.78-13.87,14.51-.05.04v.02s-.06.05-.06.05l-.05.05-.05.05c-.96,1.06-1.55,2.47-1.55,4.01,0,.93.21,1.8.59,2.59"/></svg>`,
  
  hope: `<svg viewBox="0 0 128.25 175.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#896749" d="M68.48,145.99c-2.25,2.72-6.26,2.82-8.49.16-6.84-8.15-13.05-16.58-18.79-25.57-6.34-9.92-12.33-21.34-15.04-32.82-2.86-12.12,0-24.6,8.04-34.22,7.56-9.03,19.12-14.27,31.11-13.89,24.78.79,42.52,23.94,36.78,48.04-1.17,4.92-2.8,9.69-4.97,14.47-7.01,15.4-17.77,30.63-28.64,43.82Z"/><path fill="#ffb261" d="M34.86,40.46l.07.13,27.14,56.85.1.21c.37.69,1.12,1.17,1.96,1.17s1.57-.47,1.95-1.15v-.02s.12-.23.12-.23l27.13-56.83.08-.16.3-.62h0c.45-1.08.7-2.25.7-3.47,0-4.93-4-8.92-8.93-8.92h-42.71c-4.93,0-8.92,3.99-8.92,8.92,0,1.23.25,2.4.7,3.47l.02.05h0s.29.6.29.6Z"/></svg>`,
  
  flamma: `<svg viewBox="0 0 128.25 175.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#8e4000" d="M68.48,153.34c-2.25,2.72-6.26,2.82-8.49.16-6.84-8.15-13.05-16.58-18.79-25.57-6.34-9.92-12.33-21.34-15.04-32.82-2.86-12.12,0-24.6,8.04-34.22,7.56-9.03,19.12-14.27,31.11-13.89,24.78.79,42.52,23.94,36.78,48.04-1.17,4.92-2.8,9.69-4.97,14.47-7.01,15.4-17.77,30.63-28.64,43.82Z"/><path fill="#ff8000" d="M69.54,48.02c3.07,3.28,7.54,4.63,8.86,9.35l-1.12,1.14c.1-.09,1.39-.04,1.41.09.2,1.33.25,2.65.14,3.95-.26,3.11-.78,6.17-1.55,9.2-.86,3.35-2.61,5.06.84,8.74.11.12.18.23.21.33.05.17.02.31-.06.41-.24.29-.18.4.19.34.85-.14,1.84.12,2.73.07.56-.03,1.07-.22,1.53-.56.84-.63,1.6-1.36,2.27-2.18.06-.08.1-.17.11-.27l.05-.58c.01-.13.07-.23.18-.3,1.9-1.18.24-.93.17-1.31-.05-.27-.02-.54.07-.79l.2-.17v-.47c-.14-.01-.23-.09-.25-.24-.28-1.66-.81-3.24-1.61-4.72-.04-.07-.02-.12.05-.15l.13-.06c.05-.02.09-.01.11.04.35.84.87,1.5,1.57,1.97.3.2,3.82,4.69,3.85,4.73,5.9,7.73,3.89,19.06.26,22.08-8.42,8.85-16.84,17.69-25.26,26.54-.11.1-.48.34-.88,0l-25.33-26.49c-1.33-1.26-5.49-7.97-2.33-16.25,1.48-3.87,4.38-8.62,6.38-12.42,1.51-2.87,2.96-6.57,1.75-9.85-.05-.14.08-.29.23-.25,3.71.92,6.38,5.27,8.06,8.59.34.66.51,1.26.53,1.8,0,.13.05.25.14.35.6.67.89,1.48.86,2.41,0,.11.07.21.17.25.06.02.12.02.17,0,.05-.02.08-.06.11-.12,1.25-2.31.48-5.16-.31-7.85-1.58-5.4-3.08-10.87-3.75-16.48-.13-1.08.02-2.14-.06-3.11-.17-2.16-.05-4.3.37-6.43.09-.49-.26.84.12-.86,1.74-7.6,6.16-13.8,12.34-18.39.05-.04.1-.04.14.01.07.07.09.17.05.28-3.94,9.6-.64,20.35,6.18,27.65"/></svg>`,
  
  flick: `<svg viewBox="0 0 128.25 175.5" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><path fill="#7f0000" d="M70.85,157.74c-2.25,2.72-6.26,2.82-8.49.16-6.84-8.15-13.05-16.58-18.79-25.57-6.34-9.92-12.33-21.34-15.04-32.82-2.86-12.12,0-24.6,8.04-34.22,7.56-9.03,19.12-14.27,31.11-13.89,24.78.79,42.52,23.94,36.78,48.04-1.17,4.92-2.8,9.69-4.97,14.47-7.01,15.4-17.77,30.63-28.64,43.82Z"/><path fill="#f00d0a" d="M83.78,100.34c-1.06-7.74,1.07-20.65,1.12-28.94.08-13-1.13-51.1-1.85-55.73l-17.69,55.74c-.46,2.37-1.24,4.31-1.77,6.45l-2.43,6.16c-5.5-8.75-17.12-23.01-24.38-32.97l-3.95-4.09c-.21,3.6,2.13,10.08,3.22,13.95l9.67,35.39c.46,2.29-.03-.56.24,1.7l-.1,1.59c-2.67-.4-3.78-1.17-6.63-1.95l-12.14-3.7c-3.55-1.3-1.84-1.55-5.71-1.62,3.92,5.16,12.15,12.45,17.19,17.44,5.97,5.91,12.48,9.85,19.08,11.89l-12.87-12.78c3.95.65,7.03,2.62,11.47,3.02l-7.72-30.13c5.79,5.12,11.89,21.4,17.93,25.86l9.96-43.79c.83,13.81-2.85,36.45-.98,49.02l8.36-4.1c-.31.56-.51,1.03-1.15,1.93-.46.64-.86,1.02-1.35,1.62l-7.45,9.44c3.41-1.39,9.17-4.74,12.07-6.81l20.8-27.73c-.05-.39.17-.54.15-1l-23.09,14.15Z"/></svg>`
};

export const getPinSvgContent = (perfil?: string, ministerio?: string, nome?: string): string => {
  const combined = `${perfil || ''} ${ministerio || ''} ${nome || ''}`.toLowerCase();

  // 1. Homens (Forja / Homens de Atos)
  if (combined.includes('homem') || combined.includes('forja')) {
    return PINS_SVG_INLINE.homens;
  }
  // 2. Mulheres (Mulheres de Atitude / Celeiro)
  if (combined.includes('mulher') || combined.includes('celeiro') || combined.includes('atitude')) {
    return PINS_SVG_INLINE.mulheres;
  }
  // 3. Jovens (Flamma / Tocha / Fuego)
  if (
    combined.includes('flamma') ||
    combined.includes('joven') ||
    combined.includes('jovem') ||
    combined.includes('tocha') ||
    combined.includes('fuego')
  ) {
    return PINS_SVG_INLINE.flamma;
  }
  // 4. Adolescentes (Flick / Teens / Brasa / Fire)
  if (
    combined.includes('flick') ||
    combined.includes('teen') ||
    combined.includes('adolescente') ||
    combined.includes('brasa') ||
    combined.includes('fire')
  ) {
    return PINS_SVG_INLINE.flick;
  }
  // 5. Casais (Hope / Casais / Mista)
  if (
    combined.includes('hope') ||
    combined.includes('casai') ||
    combined.includes('casal') ||
    combined.includes('mista') ||
    combined.includes('misto')
  ) {
    return PINS_SVG_INLINE.hope;
  }
  
  return PINS_SVG_INLINE.homens;
};

// Gerador de ícone customizado SVG OFICIAL para pins de células (PIN GRÁFICO, SEM NOMES)
const createCustomPinIcon = (celula: Celula, isSelected: boolean) => {
  const svgMarkup = getPinSvgContent(celula.perfil, celula.ministerio, celula.nome);
  const width = isSelected ? 42 : 36;
  const height = isSelected ? 57.5 : 49.25;

  const html = `
    <div class="pin-svg-container ${isSelected ? 'selected' : ''}" style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease;
      filter: ${isSelected ? 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.9)) drop-shadow(0 6px 12px rgba(0,0,0,0.5))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.45))'};
      transform: ${isSelected ? 'scale(1.18) translateY(-6px)' : 'scale(1)'};
    ">
      ${svgMarkup}
    </div>
  `;

  return L.divIcon({
    className: 'custom-cell-pin-svg',
    html: html,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  });
};

// Ícone do usuário (GPS)
const createUserPinIcon = () => {
  const html = `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 24px; height: 24px; background: rgba(12, 142, 230, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 14px; height: 14px; background: #0c8ee6; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); z-index: 10;"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-user-pin',
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const MapContainer: React.FC<MapViewProps> = ({
  celulas,
  selectedCelula,
  onSelectCelula,
  onOpenChurch,
  userLocation,
  onRequestUserLocation,
  viewMode,
  onToggleViewMode,
  targetCoords,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const { igrejaSede } = useIgrejaSede();

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(
        [TIMOTEO_CENTER.lat, TIMOTEO_CENTER.lng],
        TIMOTEO_CENTER.zoom,
        { duration: 0.8 }
      );
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <LeafletMap
        center={[TIMOTEO_CENTER.lat, TIMOTEO_CENTER.lng]}
        zoom={TIMOTEO_CENTER.zoom}
        zoomControl={false}
        attributionControl={false}
        className="w-full h-full"
        ref={(ref) => {
          if (ref) mapRef.current = ref;
        }}
      >
        {/* OpenStreetMap - 100% gratuito, sem API key */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController
          targetCoords={targetCoords}
          selectedCelula={selectedCelula}
        />

        {/* MARCADOR FIXO AMARELO DA SEDE DA IGREJA ATOS */}
        {igrejaSede?.coords && (
          <Marker
            position={[igrejaSede.coords.lat, igrejaSede.coords.lng]}
            icon={createIgrejaSedePinIcon()}
            eventHandlers={{
              click: () => onOpenChurch && onOpenChurch(),
            }}
          />
        )}

        {/* Marcadores das Células (Marcadores oficiais das células ativas) */}
        {celulas.map((celula) => {
          if (!celula.ativo) return null;
          const pos = celula.itinerante ? celula.encontroAtual?.coords : celula.coords;
          if (!pos || typeof pos.lat !== 'number' || typeof pos.lng !== 'number') return null;

          const isSelected = selectedCelula?.id === celula.id;
          return (
            <Marker
              key={celula.id}
              position={[pos.lat, pos.lng]}
              icon={createCustomPinIcon(celula, isSelected)}
              eventHandlers={{
                click: () => onSelectCelula(celula),
              }}
            />
          );
        })}

        {/* Localização GPS do Usuário */}
        {userLocation.coords && (
          <>
            <Marker
              position={[userLocation.coords.lat, userLocation.coords.lng]}
              icon={createUserPinIcon()}
            />
            <Circle
              center={[userLocation.coords.lat, userLocation.coords.lng]}
              radius={250}
              pathOptions={{
                color: '#0c8ee6',
                fillColor: '#0c8ee6',
                fillOpacity: 0.1,
                weight: 1.5,
              }}
            />
          </>
        )}
      </LeafletMap>

      {/* Controles Flutuantes do Mapa (Thumb Zone - Lado Direito Inferior) */}
      <div className="absolute right-4 bottom-[calc(var(--sab)+28px)] z-20 flex flex-col gap-2.5">
        {/* Alternar Visualização: Mapa / Lista */}
        <button
          type="button"
          onClick={onToggleViewMode}
          className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white font-semibold text-xs shadow-floating backdrop-blur-md border border-slate-700/80 active:scale-95 transition-all"
        >
          {viewMode === 'map' ? (
            <>
              <List className="w-4 h-4 text-brand-400" />
              <span>Ver Lista</span>
            </>
          ) : (
            <>
              <MapIcon className="w-4 h-4 text-brand-400" />
              <span>Ver Mapa</span>
            </>
          )}
        </button>

        {/* Botão Usar Minha Localização GPS */}
        <button
          type="button"
          onClick={onRequestUserLocation}
          disabled={userLocation.loading}
          aria-label="Usar minha localização atual"
          className="w-12 h-12 rounded-2xl bg-white/95 hover:bg-white text-slate-800 flex items-center justify-center shadow-floating border border-slate-200/80 active:scale-95 transition-all"
        >
          {userLocation.loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
          ) : (
            <Locate className={`w-5 h-5 ${userLocation.coords ? 'text-brand-600' : 'text-slate-600'}`} />
          )}
        </button>

        {/* Botão Recentralizar Timóteo */}
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recentralizar em Timóteo"
          className="w-12 h-12 rounded-2xl bg-white/95 hover:bg-white text-slate-700 flex items-center justify-center shadow-floating border border-slate-200/80 active:scale-95 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
