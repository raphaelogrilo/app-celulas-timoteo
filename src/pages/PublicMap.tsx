import { useState, useMemo, useCallback } from 'react';
import type { Celula, PerfilCelula, DiaSemana, UserLocation, Coords } from '../types/celula';
import { useCelulas } from '../hooks/useCelulas';
import { TIMOTEO_CENTER } from '../data/bairrosTimoteo';
import { Header } from '../components/Header';
import { FilterChips } from '../components/FilterChips';
import { MapContainer } from '../components/MapContainer';
import { BottomSheet } from '../components/BottomSheet';
import { ListView } from '../components/ListView';
import { InfoModal } from '../components/InfoModal';
import { ChurchModal } from '../components/ChurchModal';

export default function PublicMap() {
  const [selectedCelula, setSelectedCelula] = useState<Celula | null>(null);
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilCelula>('Todos');
  const [selectedDia, setSelectedDia] = useState<DiaSemana>('Todos');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isChurchModalOpen, setIsChurchModalOpen] = useState(false);
  const [targetCoords, setTargetCoords] = useState<Coords | null>(null);

  const [userLocation, setUserLocation] = useState<UserLocation>({
    coords: null as any,
    loading: false,
    error: null,
  });

  // Dados em tempo real do Firestore
  const { celulas: allCelulas, loading: loadingCelulas } = useCelulas(
    userLocation.coords ?? null
  );

  const handleRequestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    setUserLocation(prev => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation({ coords, accuracy: position.coords.accuracy, loading: false, error: null });
        setTargetCoords(coords);
      },
      (error) => {
        console.warn('GPS error:', error);
        setUserLocation(prev => ({ ...prev, loading: false, error: 'Localização não disponível.' }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  // Filtragem por Perfil e Dia
  const filteredCelulas = useMemo(() => {
    return allCelulas
      .filter((celula) => {
        if (selectedPerfil !== 'Todos') {
          const perf = (celula.perfil || '').toLowerCase();
          const min = (celula.ministerio || '').toLowerCase();

          if (selectedPerfil === 'Homens') {
            if (perf !== 'homens' && !min.includes('homem')) return false;
          } else if (selectedPerfil === 'Mulheres') {
            if (perf !== 'mulheres' && !min.includes('mulher')) return false;
          } else if (selectedPerfil === 'Casais') {
            if (perf !== 'casais' && !min.includes('hope') && !min.includes('casai') && !min.includes('casal')) return false;
          } else if (selectedPerfil === 'Jovens') {
            if (perf !== 'jovens' && !min.includes('flamma') && !min.includes('joven') && !min.includes('jovem')) return false;
          } else if (selectedPerfil === 'Adolescentes') {
            if (perf !== 'adolescentes' && perf !== 'teens' && !min.includes('flick') && !min.includes('teen') && !min.includes('adolescente')) return false;
          } else {
            if (celula.perfil !== selectedPerfil) return false;
          }
        }

        // Para filtro de dia: célula fixa usa celula.dia, itinerante usa encontroAtual.dia
        const diaEfetivo = celula.itinerante ? celula.encontroAtual?.dia : celula.dia;
        if (selectedDia !== 'Todos' && diaEfetivo !== selectedDia) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.distanciaKm !== undefined && b.distanciaKm !== undefined) {
          return a.distanciaKm - b.distanciaKm;
        }
        return a.nome.localeCompare(b.nome);
      });
  }, [allCelulas, selectedPerfil, selectedDia]);

  const handleResetFilters = () => {
    setSelectedPerfil('Todos');
    setSelectedDia('Todos');
    setTargetCoords({ lat: TIMOTEO_CENTER.lat, lng: TIMOTEO_CENTER.lng });
  };

  return (
    <main className="viewport-locked flex flex-col bg-slate-900 text-slate-800">
      <Header
        totalCelulas={allCelulas.length}
        filteredCount={filteredCelulas.length}
        onOpenInfo={() => setIsInfoOpen(true)}
        loading={loadingCelulas}
      />

      <FilterChips
        selectedPerfil={selectedPerfil}
        onSelectPerfil={setSelectedPerfil}
        selectedDia={selectedDia}
        onSelectDia={setSelectedDia}
        onResetFilters={handleResetFilters}
      />

      <div className="relative flex-1 w-full h-full overflow-hidden">
        {viewMode === 'map' ? (
          <MapContainer
            celulas={filteredCelulas}
            selectedCelula={selectedCelula}
            onSelectCelula={setSelectedCelula}
            onOpenChurch={() => setIsChurchModalOpen(true)}
            userLocation={userLocation}
            onRequestUserLocation={handleRequestUserLocation}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            targetCoords={targetCoords}
          />
        ) : (
          <div className="w-full h-full flex flex-col bg-slate-950 pt-2">
            <ListView
              celulas={filteredCelulas}
              onSelectCelula={setSelectedCelula}
              onResetFilters={handleResetFilters}
            />
            <div className="fixed right-4 bottom-[calc(var(--sab)+28px)] z-30">
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-floating active:scale-95 transition-all"
              >
                <span>Ver no Mapa</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomSheet celula={selectedCelula} onClose={() => setSelectedCelula(null)} />
      <ChurchModal isOpen={isChurchModalOpen} onClose={() => setIsChurchModalOpen(false)} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </main>
  );
}
