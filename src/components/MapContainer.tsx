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

// Determina a URL do pin SVG oficial de acordo com o ministério / perfil
export const getPinSvgUrl = (perfil?: string, ministerio?: string): string => {
  const min = (ministerio || '').toLowerCase();
  const perf = (perfil || '').toLowerCase();

  if (min.includes('homem') || perf.includes('homem')) return '/pins/homens.svg';
  if (min.includes('mulher') || perf.includes('mulher')) return '/pins/mulheres.svg';
  if (min.includes('hope') || perf.includes('casai') || perf.includes('casal')) return '/pins/hope.svg';
  if (min.includes('flamma') || perf.includes('joven') || perf.includes('jovem')) return '/pins/flamma.svg';
  if (min.includes('flick') || perf.includes('teen') || perf.includes('adolescente')) return '/pins/flick.svg';
  
  return '/pins/hope.svg';
};

// Gerador de ícone customizado SVG OFICIAL para pins de células (PIN GRÁFICO, SEM NOMES)
const createCustomPinIcon = (celula: Celula, isSelected: boolean) => {
  const pinUrl = getPinSvgUrl(celula.perfil, celula.ministerio);
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
      <img
        src="${pinUrl}"
        alt=""
        style="
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
          display: block;
        "
      />
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

        {/* Marcadores das Células (Somente células ativas com endereço/pin exato cadastrado) */}
        {celulas.map((celula) => {
          if (!celula.ativo) return null;
          const pos = celula.itinerante ? celula.encontroAtual?.coords : celula.coords;
          if (!pos || typeof pos.lat !== 'number' || typeof pos.lng !== 'number') return null;

          // Validação: deve possuir endereço ou dados de geolocalização exata
          const hasExactAddress = celula.itinerante
            ? (!!celula.encontroAtual?.endereco || !!celula.encontroAtual?.coords)
            : (!!celula.endereco && !!celula.coords);

          if (!hasExactAddress) return null;

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
