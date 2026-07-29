import { useEffect, useState, useRef } from 'react';
import { createYjsProvider } from '../utils/yjsSetup';

export function useYjs(roomId) {
  const [ready, setReady] = useState(false);
  const providerRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const provider = createYjsProvider(roomId);
    providerRef.current = provider;

    provider.provider.on('status', (event) => {
      if (event.status === 'connected') {
        setReady(true);
      }
    });

    // Fallback in case status event is missed
    setTimeout(() => setReady(true), 800);

    return () => {
      provider.destroy();
      providerRef.current = null;
      setReady(false);
    };
  }, [roomId]);

  return {
    doc: providerRef.current?.doc ?? null,
    awareness: providerRef.current?.awareness ?? null,
    ready,
  };
}