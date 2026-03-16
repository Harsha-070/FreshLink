const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

// GET /api/requirements
router.get('/', authenticateToken, (req, res) => {
  const myReqs = db.requirements.filter((r) => r.businessId === req.user.id);
  res.json({ requirements: myReqs, total: myReqs.length });
});

// POST /api/requirements
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'business') return res.status(403).json({ error: 'Business access only' });

  const { items, urgency, neededBy, mealType } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Items required' });

  const newReq = {
    id: uuidv4(), businessId: req.user.id, items,
    urgency: urgency || 'medium', status: 'open',
    neededBy: neededBy || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(), mealType: mealType || 'General',
  };

  db.requirements.push(newReq);
  scheduleSave();
  res.status(201).json({ message: 'Requirement posted', requirement: newReq });
});

// PUT /api/requirements/:id
router.put('/:id', authenticateToken, (req, res) => {
  const item = db.requirements.find((r) => r.id === req.params.id && r.businessId === req.user.id);
  if (!item) return res.status(404).json({ error: 'Requirement not found' });

  const { items, urgency, status, neededBy, mealType } = req.body;
  if (items) item.items = items;
  if (urgency) item.urgency = urgency;
  if (status) item.status = status;
  if (neededBy) item.neededBy = neededBy;
  if (mealType) item.mealType = mealType;

  scheduleSave();
  res.json({ message: 'Updated', requirement: item });
});

// DELETE /api/requirements/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const idx = db.requirements.findIndex((r) => r.id === req.params.id && r.businessId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.requirements.splice(idx, 1);
  scheduleSave();
  res.json({ message: 'Deleted' });
});

module.exports = router;
