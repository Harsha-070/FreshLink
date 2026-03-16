const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { initDatabase } = require('./data/db');
const { initEmailTransporter } = require('./services/otpService');

const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const orderRoutes = require('./routes/orders');
const matchingRoutes = require('./routes/matching');
const surplusRoutes = require('./routes/surplus');
const coldStorageRoutes = require('./routes/coldStorage');
const requirementRoutes = require('./routes/requirements');
const { allProduce } = require('./data/produce');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/surplus', surplusRoutes);
app.use('/api/cold-storage', coldStorageRoutes);
app.use('/api/requirements', requirementRoutes);

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'FreshLink API', db: process.env.FIREBASE_SERVICE_ACCOUNT || require('fs').existsSync(path.join(__dirname, 'serviceAccountKey.json')) ? 'firebase' : 'local' });
});

// Start server (attempt Firebase, fallback to local)
async function start() {
  try {
    await initDatabase();
  } catch (err) {
    console.log('  [DB] Firebase init failed, using local JSON:', err.message);
  }

  // Initialize email OTP service
  initEmailTransporter();

  app.listen(PORT, () => {
    console.log(`\n  FreshLink Backend running on http://localhost:${PORT}`);
    console.log(`  API Health: http://localhost:${PORT}/api/health`);
    console.log(`\n  Demo Accounts (OTP login with any 6-digit code):`);
    console.log(`    Vendor phone:   9876543210`);
    console.log(`    Business email:  spicekitchen@freshlink.com`);
    console.log(`    Password login:  ravi@freshlink.com / password123\n`);
  });
}

start();
