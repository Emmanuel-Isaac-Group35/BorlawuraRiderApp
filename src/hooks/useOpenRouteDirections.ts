import { useState, useEffect, useRef } from 'react';
import {
  fetchDrivingRoute,
  getOpenRouteServiceApiKey,
  type RoutePoint,
} from '../lib/openRouteService';

export type OpenRouteSummary = { distanceKm: number; durationMin: number };

/**
 * Fetches a driving route via OpenRouteService with debouncing (avoids spamming ORS on GPS updates).
 */
export function useOpenRouteDirections(
  origin: RoutePoint | null,
  destination: RoutePoint | null,
  debounceMs = 750
) {
  const [coordinates, setCoordinates] = useState<RoutePoint[] | null>(null);
  const [summary, setSummary] = useState<OpenRouteSummary | null>(null);
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

    const apiKey = getOpenRouteServiceApiKey();
    if (!apiKey) {
      setCoordinates(null);
      setSummary(null);
      setError('missing_api_key');
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    setError(null);
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await fetchDrivingRoute(apiKey, origin, destination);
        if (requestId.current !== id) return;
        setCoordinates(result.coordinates);
        setSummary({
          distanceKm: result.distanceKm,
          durationMin: result.durationMin,
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
