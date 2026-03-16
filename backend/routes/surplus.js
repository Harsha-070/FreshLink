const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

// GET /api/surplus
router.get('/', (req, res) => {
  const { vendorId } = req.query;
  let surplusItems = db.stock.filter((s) => s.isSurplus && s.quantity > 0);
  if (vendorId) surplusItems = surplusItems.filter((s) => s.vendorId === vendorId);

  res.json({
    surplus: surplusItems.map((s) => ({
      ...s,
      savingsPercent: s.discountPrice ? Math.round(((s.pricePerKg - s.discountPrice) / s.pricePerKg) * 100) : 0,
    })),
    total: surplusItems.length,
  });
});

// GET /api/surplus/my
router.get('/my', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Vendor access only' });

  const myStock = db.stock.filter((s) => s.vendorId === req.user.id);
  const mySurplus = myStock.filter((s) => s.isSurplus);
  const myRequests = db.surplusRequests.filter((r) => r.vendorId === req.user.id);

  res.json({
    surplus: mySurplus,
    requests: myRequests,
    stats: {
      nearExpiry: myStock.filter((s) => {
        const daysLeft = Math.ceil((new Date(s.expiryDate) - new Date()) / 86400000);
        return daysLeft <= 2 && daysLeft > 0;
      }).length,
      foodSavedKg: Math.round(mySurplus.reduce((sum, s) => sum + s.quantity, 0) * 0.7),
      activeListings: mySurplus.length,
    },
  });
});

// POST /api/surplus/cold-storage
router.post('/cold-storage', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Vendor access only' });

  const { stockId, coldStorageId, quantity, pickupTime, returnTime } = req.body;
  if (!stockId || !coldStorageId || !quantity) return res.status(400).json({ error: 'Missing required fields' });

  const request = {
    id: uuidv4(), vendorId: req.user.id, stockId, coldStorageId,
    quantity: Number(quantity), pickupTime: pickupTime || '6:00 PM',
    returnTime: returnTime || '6:00 AM', status: 'scheduled',
    createdAt: new Date().toISOString(),
  };

  db.surplusRequests.push(request);
  scheduleSave();
  res.status(201).json({ message: 'Cold storage request created', request });
});

module.exports = router;
