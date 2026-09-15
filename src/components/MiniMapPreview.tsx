import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Coords } from '../types/celula';
import { Navigation, ZoomIn, ZoomOut, CheckCircle2 } from 'lucide-react';

interface MiniMapPreviewProps {
  coords: Coords;
  title?: string;
  onCoordsChange?: (coords: Coords) => void;
  interactive?: boolean;
}

// Sub-componente para recentralizar o mapa quando as coordenadas mudam
const MiniMapController: React.FC<{ coords: Coords }> = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 17, { duration: 0.8 });
      // Invalida tamanho para garantir renderização perfeita dentro de modais/containers
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, [coords, map]);

  return null;
};

// Gerador do Pin Customizado
const createExactPinIcon = (label?: string) => {
  const html = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      pointer-events: none;
    ">
      <div style="
        background: linear-gradient(135deg, #FA6400, #EA580C);
        color: #ffffff;
        padding: 4px 10px;
        border-radius: 9999px;
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        font-size: 11px;
        font-weight: 800;
        box-shadow: 0 4px 14px rgba(234, 88, 12, 0.4), 0 2px 6px rgba(0,0,0,0.2);
        border: 2px solid #ffffff;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
      ">
        <span>📍</span>
        <span>${label || 'Local Exato da Célula'}</span>
      </div>
      <div style="
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid #EA580C;
        margin-top: -1px;
      "></div>
      <div style="
        width: 8px;
        height: 8px;
        background: #0f172a;
        border: 2px solid #ffffff;
        border-radius: 50%;
        margin-top: -3px;
        box-shadow: 0 0 8px rgba(0,0,0,0.5);
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'exact-pin-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({
  coords,
  title,
  onCoordsChange,
  interactive = true,
}) => {
  const mapRef = useRef<L.Map | null>(null);

  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    return null;
  }

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();

  const handleRecenter = () => {
    mapRef.current?.flyTo([coords.lat, coords.lng], 17, { duration: 0.5 });
  };

  return (
    <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Prévia do Pin no Mapa (Localização Exata)
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </span>
      </div>

      <div className="relative w-full h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-xl bg-slate-950">
        <LeafletMap
          center={[coords.lat, coords.lng]}
          zoom={17}
          zoomControl={false}
          attributionControl={false}
          className="w-full h-full z-0"
          ref={(ref) => {
            if (ref) mapRef.current = ref;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MiniMapController coords={coords} />

          <Marker
            position={[coords.lat, coords.lng]}
            icon={createExactPinIcon(title)}
            draggable={interactive && !!onCoordsChange}
            eventHandlers={{
              dragend: (e) => {
                if (onCoordsChange) {
                  const latlng = e.target.getLatLng();
                  onCoordsChange({ lat: latlng.lat, lng: latlng.lng });
                }
              },
            }}
          />
        </LeafletMap>

        {/* Controles Flutuantes do Mini-Mapa */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-md border border-white/10 transition-colors"
            title="Aproximar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-md border border-white/10 transition-colors"
            title="Afastar Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-md border border-white/10 transition-colors"
            title="Recentralizar no Pin"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Rodapé Informativo */}
        <div className="absolute left-3 bottom-2 z-10 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-slate-300 font-medium pointer-events-none">
          {interactive && onCoordsChange ? '💡 Você pode arrastar o pin para ajuste fino' : '📍 Pin fixado no endereço'}
        </div>
      </div>
    </div>
  );
};
