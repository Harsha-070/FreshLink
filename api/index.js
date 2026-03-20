const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('../backend/routes/auth');
const stockRoutes = require('../backend/routes/stock');
const orderRoutes = require('../backend/routes/orders');
const matchingRoutes = require('../backend/routes/matching');
const surplusRoutes = require('../backend/routes/surplus');
const coldStorageRoutes = require('../backend/routes/coldStorage');
const requirementRoutes = require('../backend/routes/requirements');
const logisticsRoutes = require('../backend/routes/logistics');
const notificationRoutes = require('../backend/routes/notifications');
const paymentRoutes = require('../backend/routes/payments');
const { allProduce } = require('../backend/data/produce');

// Initialize database
const { initDatabase } = require('../backend/data/db');
initDatabase().catch(() => console.log('Using local JSON storage'));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/surplus', surplusRoutes);
app.use('/api/cold-storage', coldStorageRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);

// GET /api/produce
app.get('/api/produce', (req, res) => {
  const { category, search } = req.query;
  let filtered = [...allProduce];
  if (category && category !== 'All') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.subCategory && p.subCategory.toLowerCase().includes(q))
    );
  }
  res.json({ produce: filtered, total: filtered.length });
});

// GET /api/areas
app.get('/api/areas', (req, res) => {
  res.json({
    city: 'Hyderabad',
    areas: [
      { name: 'Madhapur', zone: 'West', lat: 17.4400, lng: 78.3489, active: true },
      { name: 'Gachibowli', zone: 'West', lat: 17.4401, lng: 78.3489, active: true },
      { name: 'Kondapur', zone: 'West', lat: 17.4592, lng: 78.3568, active: true },
      { name: 'Hitech City', zone: 'West', lat: 17.4435, lng: 78.3772, active: true },
      { name: 'Kukatpally', zone: 'West', lat: 17.4948, lng: 78.3996, active: true },
      { name: 'Jubilee Hills', zone: 'Central', lat: 17.4325, lng: 78.4073, active: true },
      { name: 'Banjara Hills', zone: 'Central', lat: 17.4156, lng: 78.4347, active: true },
      { name: 'Ameerpet', zone: 'Central', lat: 17.4375, lng: 78.4483, active: true },
      { name: 'Secunderabad', zone: 'North', lat: 17.4399, lng: 78.4983, active: true },
      { name: 'Dilsukhnagar', zone: 'East', lat: 17.3688, lng: 78.5247, active: true },
    ],
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'FreshLink API', version: '1.0.0' });
});

// Export for Vercel
module.exports = app;
