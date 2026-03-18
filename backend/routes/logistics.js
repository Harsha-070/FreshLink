const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDistanceKm, estimateDeliveryCost } = require('../utils/distance');

const router = express.Router();

// Instakart delivery partners (simulated fleet)
const instakartPartners = [
  { id: 'ik-1', name: 'Raju Kumar', phone: '9876543201', vehicleType: 'bike', rating: 4.8, available: true, location: { lat: 17.4400, lng: 78.3489 } },
  { id: 'ik-2', name: 'Suresh Reddy', phone: '9876543202', vehicleType: 'bike', rating: 4.6, available: true, location: { lat: 17.3850, lng: 78.4867 } },
  { id: 'ik-3', name: 'Venkat Rao', phone: '9876543203', vehicleType: 'auto', rating: 4.9, available: true, location: { lat: 17.4239, lng: 78.4738 } },
  { id: 'ik-4', name: 'Krishna Murthy', phone: '9876543204', vehicleType: 'mini-truck', rating: 4.7, available: true, location: { lat: 17.3616, lng: 78.4747 } },
  { id: 'ik-5', name: 'Anil Prasad', phone: '9876543205', vehicleType: 'bike', rating: 4.5, available: true, location: { lat: 17.4156, lng: 78.4347 } },
  { id: 'ik-6', name: 'Mahesh Babu', phone: '9876543206', vehicleType: 'auto', rating: 4.8, available: false, location: { lat: 17.4948, lng: 78.3996 } },
  { id: 'ik-7', name: 'Srinivas Goud', phone: '9876543207', vehicleType: 'mini-truck', rating: 4.6, available: true, location: { lat: 17.3753, lng: 78.5244 } },
  { id: 'ik-8', name: 'Ramesh Yadav', phone: '9876543208', vehicleType: 'bike', rating: 4.4, available: true, location: { lat: 17.4501, lng: 78.3816 } },
];

// Delivery pricing tiers
const deliveryPricing = {
  bike: { baseRate: 25, perKm: 8, maxWeight: 10 }, // Up to 10kg
  auto: { baseRate: 40, perKm: 12, maxWeight: 50 }, // Up to 50kg
  'mini-truck': { baseRate: 80, perKm: 18, maxWeight: 200 }, // Up to 200kg
};

// GET /api/logistics/partners - Get available Instakart partners
router.get('/partners', (req, res) => {
  const { lat, lng, vehicleType } = req.query;
  const pickupLat = parseFloat(lat) || 17.385;
  const pickupLng = parseFloat(lng) || 78.4867;

  let partners = instakartPartners.filter(p => p.available);

  if (vehicleType) {
    partners = partners.filter(p => p.vehicleType === vehicleType);
  }

  // Calculate distance and ETA for each partner
  const partnersWithDistance = partners.map(partner => {
    const distance = getDistanceKm(pickupLat, pickupLng, partner.location.lat, partner.location.lng);
    const eta = Math.ceil(distance * 3); // ~3 min per km
    return {
      ...partner,
      distanceKm: distance,
      eta: eta < 5 ? '5 mins' : `${eta} mins`,
    };
  });

  // Sort by distance
  partnersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({ partners: partnersWithDistance });
});

// POST /api/logistics/estimate - Get delivery cost estimate
router.post('/estimate', (req, res) => {
  const { pickupLocation, dropLocation, weightKg, preferredVehicle } = req.body;

  if (!pickupLocation || !dropLocation) {
    return res.status(400).json({ error: 'Pickup and drop locations required' });
  }

  const distance = getDistanceKm(
    pickupLocation.lat, pickupLocation.lng,
    dropLocation.lat, dropLocation.lng
  );

  const weight = weightKg || 5;

  // Determine suitable vehicle based on weight
  let vehicleType = preferredVehicle;
  if (!vehicleType) {
    if (weight <= 10) vehicleType = 'bike';
    else if (weight <= 50) vehicleType = 'auto';
    else vehicleType = 'mini-truck';
  }

  const pricing = deliveryPricing[vehicleType];
  const deliveryCost = Math.round(pricing.baseRate + (distance * pricing.perKm));
  const platformFee = Math.round(deliveryCost * 0.1); // 10% platform fee
  const gst = Math.round((deliveryCost + platformFee) * 0.18); // 18% GST

  res.json({
    estimate: {
      distanceKm: distance,
      vehicleType,
      baseFare: pricing.baseRate,
      distanceFare: Math.round(distance * pricing.perKm),
      deliveryCost,
      platformFee,
      gst,
      total: deliveryCost + platformFee + gst,
      eta: `${Math.ceil(distance * 3 + 10)}-${Math.ceil(distance * 3 + 20)} mins`,
    }
  });
});

// POST /api/logistics/book - Book an Instakart delivery
router.post('/book', authenticateToken, (req, res) => {
  const { orderId, partnerId, pickupLocation, dropLocation, weightKg, instructions } = req.body;

  if (!orderId || !pickupLocation || !dropLocation) {
    return res.status(400).json({ error: 'Order ID and locations required' });
  }

  // Find available partner (if specific partner requested)
  let partner;
  if (partnerId) {
    partner = instakartPartners.find(p => p.id === partnerId && p.available);
  } else {
    // Auto-assign nearest available partner
    const distance = (p) => getDistanceKm(pickupLocation.lat, pickupLocation.lng, p.location.lat, p.location.lng);
    const available = instakartPartners.filter(p => p.available);
    available.sort((a, b) => distance(a) - distance(b));
    partner = available[0];
  }

  if (!partner) {
    return res.status(404).json({ error: 'No delivery partners available' });
  }

  const tripDistance = getDistanceKm(pickupLocation.lat, pickupLocation.lng, dropLocation.lat, dropLocation.lng);
  const pricing = deliveryPricing[partner.vehicleType];
  const deliveryCost = Math.round(pricing.baseRate + (tripDistance * pricing.perKm));

  const booking = {
    id: `INK-${Date.now()}`,
    orderId,
    partner: {
      id: partner.id,
      name: partner.name,
      phone: partner.phone,
      vehicleType: partner.vehicleType,
      rating: partner.rating,
    },
    pickup: pickupLocation,
    drop: dropLocation,
    distanceKm: tripDistance,
    weightKg: weightKg || 5,
    deliveryCost,
    status: 'assigned',
    eta: `${Math.ceil(tripDistance * 3 + 15)} mins`,
    instructions: instructions || '',
    createdAt: new Date().toISOString(),
    timeline: [
      { status: 'assigned', time: new Date().toISOString(), message: `${partner.name} assigned for pickup` }
    ]
  };

  res.status(201).json({ booking });
});

// GET /api/logistics/track/:bookingId - Track delivery status
router.get('/track/:bookingId', (req, res) => {
  // Simulated tracking response
  const { bookingId } = req.params;

  res.json({
    bookingId,
    status: 'in_transit',
    partner: {
      name: 'Raju Kumar',
      phone: '9876543201',
      vehicleType: 'bike',
    },
    currentLocation: { lat: 17.4100, lng: 78.4500 },
    eta: '12 mins',
    timeline: [
      { status: 'assigned', time: '2026-03-18T10:00:00Z', message: 'Delivery partner assigned' },
      { status: 'picked_up', time: '2026-03-18T10:15:00Z', message: 'Order picked up from vendor' },
      { status: 'in_transit', time: '2026-03-18T10:18:00Z', message: 'On the way to delivery location' },
    ]
  });
});

// GET /api/logistics/pricing - Get pricing info
router.get('/pricing', (req, res) => {
  res.json({
    provider: 'Instakart',
    pricing: deliveryPricing,
    serviceAreas: [
      'Madhapur', 'Gachibowli', 'Kondapur', 'Hitech City', 'Kukatpally',
      'Jubilee Hills', 'Banjara Hills', 'Ameerpet', 'SR Nagar', 'Begumpet',
      'Secunderabad', 'Kompally', 'Miyapur', 'Chandanagar', 'Lingampally',
      'LB Nagar', 'Dilsukhnagar', 'Uppal', 'Habsiguda', 'Tarnaka',
      'Bowenpally', 'Malkajgiri', 'ECIL', 'AS Rao Nagar', 'Sainikpuri'
    ],
    features: [
      'Real-time tracking',
      'Insured deliveries',
      'Temperature-controlled options',
      'Same-day delivery',
      'Cash on delivery support'
    ]
  });
});

module.exports = router;
