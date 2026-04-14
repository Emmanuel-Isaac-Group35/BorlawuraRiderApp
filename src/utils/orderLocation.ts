/**
 * Resolve pickup coordinates from an `orders` row (or trip payload used in navigation).
 */
export function resolvePickupFromOrder(order: any): { lat: number; lng: number } | null {
  if (!order) return null;
  let lat = Number(order.pickup_latitude) || Number(order.pickup_lat);
  let lng = Number(order.pickup_longitude) || Number(order.pickup_lng);

  if ((!lat || !lng) && typeof order.notes === 'string' && order.notes.includes('[GPS:')) {
    const coordsMatch = order.notes.match(/\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/);
    if (coordsMatch) {
      lat = Number(coordsMatch[1]);
      lng = Number(coordsMatch[2]);
    }
  }

  if (lat && lng && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return { lat, lng };
  }
  return null;
}

export function pickupAddressFromOrder(order: any): string {
  if (!order) return 'Pickup';
  const raw = order.address || order.pickup_location || '';
  const addr = String(raw).trim().replace(/^,\s*/, '').replace(/,\s*$/, '');
  return addr || 'Pickup location';
}

export function customerNameFromOrder(order: any): string {
  return (
    order?.customer_name ||
    order?.customerName ||
    order?.user_name ||
    'Customer'
  );
}
