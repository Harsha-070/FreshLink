const express = require('express');
const { coldStorages } = require('../data/seedData');
const { getDistanceKm } = require('../utils/distance');

const router = express.Router();

// GET /api/cold-storage - Get nearby cold storage facilities
router.get('/', (req, res) => {
  const { lat, lng } = req.query;
  const buyerLat = Number(lat) || 17.3850;
  const buyerLng = Number(lng) || 78.4867;

  const facilities = coldStorages.map((cs) => ({
    ...cs,
    distance: getDistanceKm(buyerLat, buyerLng, cs.location.lat, cs.location.lng),
  }));

  facilities.sort((a, b) => a.distance - b.distance);

  res.json({ facilities, total: facilities.length });
});

// GET /api/cold-storage/:id
router.get('/:id', (req, res) => {
  const facility = coldStorages.find((cs) => cs.id === req.params.id);
  if (!facility) return res.status(404).json({ error: 'Facility not found' });
  res.json(facility);
});

module.exports = router;
