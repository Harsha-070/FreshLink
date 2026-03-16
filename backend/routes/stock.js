const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');
const { allProduce } = require('../data/produce');

const router = express.Router();

// GET /api/stock - Get stock for current vendor
router.get('/', authenticateToken, (req, res) => {
  const vendorStock = db.stock.filter((s) => s.vendorId === req.user.id);
  res.json({ stock: vendorStock, total: vendorStock.length });
});

// GET /api/stock/all - Get all stock (for marketplace/matching)
router.get('/all', (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  let filtered = db.stock.filter((s) => s.quantity > 0);

  if (category && category !== 'All') {
    filtered = filtered.filter((s) => s.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((s) => s.name.toLowerCase().includes(q));
  }
  if (minPrice) filtered = filtered.filter((s) => s.pricePerKg >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((s) => s.pricePerKg <= Number(maxPrice));

  // Attach vendor info
  const withVendor = filtered.map((s) => {
    const vendor = db.users.find((u) => u.id === s.vendorId);
    return {
      ...s,
      vendorName: vendor?.name || 'Unknown Vendor',
      vendorRating: vendor?.rating || 4.0,
      vendorAddress: vendor?.location?.address || 'Hyderabad',
    };
  });

  res.json({ stock: withVendor, total: withVendor.length });
});

// POST /api/stock - Add new stock item
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Only vendors can add stock' });

  const { name, category, quantity, pricePerKg, unit, expiryDate } = req.body;
  if (!name || !quantity || !pricePerKg) return res.status(400).json({ error: 'Name, quantity, and price required' });

  const produce = allProduce.find((p) => p.name.toLowerCase() === name.toLowerCase());
  const newItem = {
    id: uuidv4(), vendorId: req.user.id, produceId: produce?.id || null,
    name, category: category || produce?.category || 'Vegetables',
    quantity: Number(quantity), pricePerKg: Number(pricePerKg),
    minPrice: produce?.minPrice || 0, maxPrice: produce?.maxPrice || 0,
    unit: unit || produce?.unit || 'kg',
    image: produce?.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
    status: Number(quantity) > 10 ? 'In Stock' : 'Low Stock',
    expiryDate: expiryDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    listedAt: new Date().toISOString(), isSurplus: false, discountPrice: null, market: 'Hyderabad',
  };

  db.stock.push(newItem);
  scheduleSave();
  res.status(201).json({ message: 'Stock added', item: newItem });
});

// PUT /api/stock/:id - Update stock item
router.put('/:id', authenticateToken, (req, res) => {
  const item = db.stock.find((s) => s.id === req.params.id && s.vendorId === req.user.id);
  if (!item) return res.status(404).json({ error: 'Stock item not found' });

  const { quantity, pricePerKg, expiryDate } = req.body;
  if (quantity !== undefined) {
    item.quantity = Number(quantity);
    item.status = Number(quantity) > 10 ? 'In Stock' : Number(quantity) > 0 ? 'Low Stock' : 'Out of Stock';
  }
  if (pricePerKg !== undefined) item.pricePerKg = Number(pricePerKg);
  if (expiryDate) item.expiryDate = expiryDate;

  scheduleSave();
  res.json({ message: 'Stock updated', item });
});

// DELETE /api/stock/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const idx = db.stock.findIndex((s) => s.id === req.params.id && s.vendorId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Stock item not found' });
  db.stock.splice(idx, 1);
  scheduleSave();
  res.json({ message: 'Stock deleted' });
});

// POST /api/stock/:id/surplus - Mark item as surplus
router.post('/:id/surplus', authenticateToken, (req, res) => {
  const item = db.stock.find((s) => s.id === req.params.id && s.vendorId === req.user.id);
  if (!item) return res.status(404).json({ error: 'Stock item not found' });

  const discount = req.body.discountPercent || 30;
  item.isSurplus = true;
  item.discountPrice = Math.round(item.pricePerKg * (1 - discount / 100));
  scheduleSave();
  res.json({ message: 'Marked as surplus', item });
});

// GET /api/stock/produce-list
router.get('/produce-list', (req, res) => {
  res.json({
    produce: allProduce.map((p) => ({
      id: p.id, name: p.name, category: p.category,
      suggestedPrice: p.pricePerKg, minPrice: p.minPrice, maxPrice: p.maxPrice, unit: p.unit,
    })),
  });
});

module.exports = router;
