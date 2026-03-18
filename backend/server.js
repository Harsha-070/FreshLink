const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initDatabase } = require('./data/db');

const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const orderRoutes = require('./routes/orders');
const matchingRoutes = require('./routes/matching');
const surplusRoutes = require('./routes/surplus');
const coldStorageRoutes = require('./routes/coldStorage');
const requirementRoutes = require('./routes/requirements');
const logisticsRoutes = require('./routes/logistics');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const { allProduce } = require('./data/produce');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  // Try public folder first (Docker), then frontend/dist
  const publicPath = path.join(__dirname, 'public');
  const distPath = path.join(__dirname, '../frontend/dist');
  const staticPath = require('fs').existsSync(publicPath) ? publicPath : distPath;
  app.use(express.static(staticPath));
}

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

// GET /api/produce - Public produce catalog
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

// GET /api/areas - Get service areas in Hyderabad
app.get('/api/areas', (req, res) => {
  res.json({
    city: 'Hyderabad',
    areas: [
      // West Hyderabad
      { name: 'Madhapur', zone: 'West', lat: 17.4400, lng: 78.3489, active: true },
      { name: 'Gachibowli', zone: 'West', lat: 17.4401, lng: 78.3489, active: true },
      { name: 'Kondapur', zone: 'West', lat: 17.4592, lng: 78.3568, active: true },
      { name: 'Hitech City', zone: 'West', lat: 17.4435, lng: 78.3772, active: true },
      { name: 'Kukatpally', zone: 'West', lat: 17.4948, lng: 78.3996, active: true },
      { name: 'Miyapur', zone: 'West', lat: 17.4969, lng: 78.3548, active: true },
      { name: 'Chandanagar', zone: 'West', lat: 17.4980, lng: 78.3250, active: true },
      { name: 'Lingampally', zone: 'West', lat: 17.4915, lng: 78.3157, active: true },
      { name: 'Manikonda', zone: 'West', lat: 17.4052, lng: 78.3872, active: true },
      { name: 'Narsingi', zone: 'West', lat: 17.3892, lng: 78.3562, active: true },
      // Central Hyderabad
      { name: 'Jubilee Hills', zone: 'Central', lat: 17.4325, lng: 78.4073, active: true },
      { name: 'Banjara Hills', zone: 'Central', lat: 17.4156, lng: 78.4347, active: true },
      { name: 'Ameerpet', zone: 'Central', lat: 17.4375, lng: 78.4483, active: true },
      { name: 'SR Nagar', zone: 'Central', lat: 17.4400, lng: 78.4450, active: true },
      { name: 'Begumpet', zone: 'Central', lat: 17.4432, lng: 78.4677, active: true },
      { name: 'Somajiguda', zone: 'Central', lat: 17.4239, lng: 78.4738, active: true },
      { name: 'Punjagutta', zone: 'Central', lat: 17.4280, lng: 78.4510, active: true },
      { name: 'Khairatabad', zone: 'Central', lat: 17.4156, lng: 78.4567, active: true },
      { name: 'Lakdi Ka Pul', zone: 'Central', lat: 17.4050, lng: 78.4650, active: true },
      { name: 'Nampally', zone: 'Central', lat: 17.3850, lng: 78.4740, active: true },
      // North Hyderabad
      { name: 'Secunderabad', zone: 'North', lat: 17.4399, lng: 78.4983, active: true },
      { name: 'Kompally', zone: 'North', lat: 17.5389, lng: 78.4833, active: true },
      { name: 'Bowenpally', zone: 'North', lat: 17.4647, lng: 78.4775, active: true },
      { name: 'Malkajgiri', zone: 'North', lat: 17.4559, lng: 78.5283, active: true },
      { name: 'Alwal', zone: 'North', lat: 17.4996, lng: 78.4975, active: true },
      { name: 'Trimulgherry', zone: 'North', lat: 17.4825, lng: 78.4953, active: true },
      { name: 'Tarnaka', zone: 'North', lat: 17.4311, lng: 78.5341, active: true },
      { name: 'Habsiguda', zone: 'North', lat: 17.4183, lng: 78.5411, active: true },
      { name: 'ECIL', zone: 'North', lat: 17.4684, lng: 78.5718, active: true },
      { name: 'AS Rao Nagar', zone: 'North', lat: 17.4553, lng: 78.5544, active: true },
      // East Hyderabad
      { name: 'Uppal', zone: 'East', lat: 17.4013, lng: 78.5588, active: true },
      { name: 'LB Nagar', zone: 'East', lat: 17.3503, lng: 78.5512, active: true },
      { name: 'Dilsukhnagar', zone: 'East', lat: 17.3688, lng: 78.5247, active: true },
      { name: 'Kothapet', zone: 'East', lat: 17.3610, lng: 78.5125, active: true },
      { name: 'Nagole', zone: 'East', lat: 17.3872, lng: 78.5650, active: true },
      { name: 'Nacharam', zone: 'East', lat: 17.4291, lng: 78.5670, active: true },
      { name: 'Mallapur', zone: 'East', lat: 17.4380, lng: 78.5556, active: true },
      // South Hyderabad
      { name: 'Mehdipatnam', zone: 'South', lat: 17.3945, lng: 78.4422, active: true },
      { name: 'Tolichowki', zone: 'South', lat: 17.3962, lng: 78.4180, active: true },
      { name: 'Attapur', zone: 'South', lat: 17.3753, lng: 78.4325, active: true },
      { name: 'Rajendra Nagar', zone: 'South', lat: 17.3195, lng: 78.4269, active: true },
      { name: 'Shamshabad', zone: 'South', lat: 17.2403, lng: 78.4294, active: true },
      { name: 'Katedan', zone: 'South', lat: 17.3432, lng: 78.4456, active: true },
      // Old City
      { name: 'Charminar', zone: 'Old City', lat: 17.3616, lng: 78.4747, active: true },
      { name: 'Abids', zone: 'Old City', lat: 17.3897, lng: 78.4747, active: true },
      { name: 'Sultan Bazaar', zone: 'Old City', lat: 17.3850, lng: 78.4867, active: true },
      { name: 'Koti', zone: 'Old City', lat: 17.3817, lng: 78.4867, active: true },
      { name: 'Moosapet', zone: 'West', lat: 17.4650, lng: 78.4283, active: true },
    ],
    marketTimings: { wholesale: { open: '04:00', close: '10:00' }, retail: { open: '06:00', close: '21:00' } }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    name: 'FreshLink API',
    version: '1.0.0',
    features: ['auth', 'stock', 'orders', 'matching', 'surplus', 'logistics', 'payments', 'notifications'],
    db: process.env.FIREBASE_SERVICE_ACCOUNT || require('fs').existsSync(path.join(__dirname, 'serviceAccountKey.json')) ? 'firebase' : 'local'
  });
});

// Serve frontend for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const publicPath = path.join(__dirname, 'public', 'index.html');
    const distPath = path.join(__dirname, '../frontend/dist/index.html');
    const indexPath = require('fs').existsSync(publicPath) ? publicPath : distPath;
    res.sendFile(indexPath);
  });
}

// Start server
async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.log('  [DB] Firebase init failed, using local JSON:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`\n  FreshLink Backend v1.0.0`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`  API Health: http://localhost:${PORT}/api/health\n`);
    console.log(`  Features: Auth | Stock | Orders | Matching | Logistics | Payments | Notifications`);
    console.log(`  Coverage: 50+ Hyderabad Areas\n`);
  });
}

start();
