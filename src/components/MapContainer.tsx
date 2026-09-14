import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import type { Celula, Coords, UserLocation } from '../types/celula';
import { TIMOTEO_CENTER } from '../data/bairrosTimoteo';
import { getProfileStyle } from '../utils/geo';
import { Locate, RotateCcw, List, Map as MapIcon, Loader2 } from 'lucide-react';

interface MapViewProps {
  celulas: Celula[];
  selectedCelula: Celula | null;
  onSelectCelula: (celula: Celula) => void;
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

// Gerador de ícone customizado SVG para pins de células
const createCustomPinIcon = (celula: Celula, isSelected: boolean) => {
  const style = getProfileStyle(celula.perfil);

  const html = `
    <div class="pin-container ${isSelected ? 'selected' : ''}" style="cursor: pointer;">
      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        background-color: ${style.pinBg};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 11px;
        font-weight: 700;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        white-space: nowrap;
      ">
        <svg style="width: 12px; height: 12px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>${celula.nome}</span>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 7px solid ${style.pinBg};
        margin-top: -1px;
      "></div>
      <div class="pin-pulse"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-cell-pin',
    html: html,
    iconSize: [120, 42],
    iconAnchor: [60, 42],
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
  userLocation,
  onRequestUserLocation,
  viewMode,
  onToggleViewMode,
  targetCoords,
}) => {
  const mapRef = useRef<L.Map | null>(null);

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

        {/* Marcadores das Células */}
        {celulas.map((celula) => {
          const pos = celula.itinerante ? celula.encontroAtual?.coords : celula.coords;
          if (!pos) return null;
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
