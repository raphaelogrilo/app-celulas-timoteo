import { useState, useEffect } from 'react';
import type { IgrejaSede } from '../types/celula';
import { fetchIgrejaSede, saveIgrejaSede, getLocalIgrejaSede } from '../services/churchService';

export function useIgrejaSede() {
  const [igrejaSede, setIgrejaSede] = useState<IgrejaSede>(getLocalIgrejaSede());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIgrejaSede().then((data) => {
      setIgrejaSede(data);
      setLoading(false);
    });

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setIgrejaSede(e.detail);
      }
    };

    window.addEventListener('igreja_sede_updated', handleUpdate);
    return () => window.removeEventListener('igreja_sede_updated', handleUpdate);
  }, []);

  const updateSede = async (newData: IgrejaSede) => {
    setIgrejaSede(newData);
    await saveIgrejaSede(newData);
  };

  return { igrejaSede, loading, updateSede };
}
