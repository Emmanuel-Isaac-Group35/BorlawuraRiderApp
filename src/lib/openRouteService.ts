import Constants from 'expo-constants';

/**
 * OpenRouteService (ORS) — driving directions on OpenStreetMap data.
 * Free tier: https://openrouteservice.org/dev/#/signup
 *
 * Set your key in app.json → expo.extra.openRouteServiceApiKey (then rebuild the app).
 */
export type RoutePoint = { latitude: number; longitude: number };

export type OrsRouteResult = {
  coordinates: RoutePoint[];
  distanceKm: number;
  durationMin: number;
};

export function getOpenRouteServiceApiKey(): string {
  const extra = Constants.expoConfig?.extra as { openRouteServiceApiKey?: string } | undefined;
  return (extra?.openRouteServiceApiKey ?? '').trim();
}

const ORS_DIRECTIONS_URL =
  'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

/**
 * Request a road route between two points. ORS expects coordinates as [longitude, latitude].
 */
export async function fetchDrivingRoute(
  apiKey: string,
  origin: RoutePoint,
  destination: RoutePoint
): Promise<OrsRouteResult> {
  if (!apiKey) {
    throw new Error('OpenRouteService API key is missing. Add expo.extra.openRouteServiceApiKey in app.json.');
  }

  const body = {
    coordinates: [
      [origin.longitude, origin.latitude],
      [destination.longitude, destination.latitude],
    ],
  };

  const res = await fetch(ORS_DIRECTIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`OpenRouteService: invalid response (${res.status})`);
  }

  if (!res.ok) {
    const errObj = data as { error?: { message?: string }; message?: string };
    const msg =
      errObj?.error?.message ||
      errObj?.message ||
      `OpenRouteService request failed (${res.status})`;
    throw new Error(msg);
  }

  const fc = data as {
    features?: Array<{
      geometry?: { type?: string; coordinates?: number[][] };
      properties?: { summary?: { distance?: number; duration?: number } };
    }>;
  };

  const feature = fc.features?.[0];
  const rawCoords = feature?.geometry?.coordinates;
  if (!Array.isArray(rawCoords) || rawCoords.length < 2) {
    throw new Error('OpenRouteService: no route geometry in response');
  }

  const coordinates: RoutePoint[] = rawCoords.map((pair) => ({
    latitude: pair[1],
    longitude: pair[0],
  }));

  const summary = feature?.properties?.summary;
  const distanceM = summary?.distance ?? 0;
  const durationS = summary?.duration ?? 0;

  return {
    coordinates,
    distanceKm: distanceM / 1000,
    durationMin: durationS / 60,
  };
}
