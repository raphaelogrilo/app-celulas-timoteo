import { useEffect, useState } from 'react';
import { listenCelulas } from '../services/celulaService';
import { calculateDistanceKm } from '../utils/geo';
import type { Celula, Coords } from '../types/celula';

/**
 * Hook que escuta células em tempo real no Firestore.
 * Calcula distância a partir da localização do usuário se disponível.
 */
export function useCelulas(userCoords?: Coords | null) {
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenCelulas((data) => {
      const enriched = data.map((c) => {
        // Para célula itinerante, usa coords do encontroAtual
        const coords = c.itinerante ? c.encontroAtual?.coords : c.coords;

        const distanciaKm =
          userCoords && coords
            ? calculateDistanceKm(userCoords, coords)
            : undefined;

        return { ...c, distanciaKm };
      });

      setCelulas(enriched);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [userCoords?.lat, userCoords?.lng]);

  return { celulas, loading, error };
}
