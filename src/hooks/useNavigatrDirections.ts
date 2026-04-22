import { useState, useEffect, useRef } from 'react';
import { NavigatrCore } from '@navigatr/core';

export type RoutePoint = { latitude: number; longitude: number };
export type NavigatrSummary = { distanceKm: number; durationMin: number };

const nav = new NavigatrCore();

/**
 * Fetches a driving route via Navigatr SDK with debouncing (avoids spamming API on GPS updates).
 */
export function useNavigatrDirections(
  origin: RoutePoint | null,
  destination: RoutePoint | null,
  debounceMs = 750
) {
  const [coordinates, setCoordinates] = useState<RoutePoint[] | null>(null);
  const [summary, setSummary] = useState<NavigatrSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!origin || !destination) {
      setCoordinates(null);
      setSummary(null);
      setError(null);
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    setError(null);
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await nav.route({
          origin: { lat: origin.latitude, lng: origin.longitude },
          destination: { lat: destination.latitude, lng: destination.longitude },
          mode: 'drive'
        });

        if (requestId.current !== id) return;

        setCoordinates(
          result.polyline.map((p) => ({ latitude: p.lat, longitude: p.lng }))
        );
        setSummary({
          distanceKm: result.distanceMeters / 1000,
          durationMin: Math.ceil(result.durationSeconds / 60),
        });
        setError(null);
      } catch (e: unknown) {
        if (requestId.current !== id) return;
        const message = e instanceof Error ? e.message : 'Route request failed';
        setCoordinates(null);
        setSummary(null);
        setError(message);
      } finally {
        if (requestId.current === id) {
          setLoading(false);
        }
      }
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [
    origin?.latitude,
    origin?.longitude,
    destination?.latitude,
    destination?.longitude,
    debounceMs,
  ]);

  return { coordinates, summary, loading, error };
}
