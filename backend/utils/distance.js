// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// Estimate delivery cost based on distance
function estimateDeliveryCost(distanceKm) {
  if (distanceKm <= 1) return 20;
  if (distanceKm <= 2) return 30;
  if (distanceKm <= 3) return 40;
  if (distanceKm <= 4) return 50;
  return 50 + Math.round((distanceKm - 4) * 15);
}

module.exports = { getDistanceKm, estimateDeliveryCost };
