const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'freshlink-pro-secret-2026';

// In-memory database for serverless
const db = {
  users: [
    {
      id: 'vendor-1',
      name: 'Fresh Farms Vendor',
      phone: '9876543210',
      password: '$2a$10$xVqYLGrwC5Hn5ULhMd5LyeUXdQKzLGVPfhGmBJkXWcKCFpCRiRLHi', // password123
      role: 'vendor',
      email: 'vendor@freshlink.com',
      rating: 4.5,
      shopName: 'Fresh Farms',
      shopAddress: 'Madhapur, Hyderabad',
      upiId: 'freshfarms@upi',
      location: { lat: 17.4400, lng: 78.3489, address: 'Madhapur, Hyderabad' },
      totalOrders: 150,
    },
    {
      id: 'business-1',
      name: 'Hotel Grand Kitchen',
      phone: '9988776655',
      password: '$2a$10$xVqYLGrwC5Hn5ULhMd5LyeUXdQKzLGVPfhGmBJkXWcKCFpCRiRLHi', // password123
      role: 'business',
      email: 'business@freshlink.com',
      businessType: 'Restaurant',
      deliveryAddress: 'Jubilee Hills, Hyderabad',
      location: { lat: 17.4325, lng: 78.4073, address: 'Jubilee Hills, Hyderabad' },
      totalOrders: 85,
    },
  ],
  stock: [
    { id: 's1', vendorId: 'vendor-1', name: 'Tomato', category: 'Vegetables', quantity: 100, pricePerKg: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's2', vendorId: 'vendor-1', name: 'Onion', category: 'Vegetables', quantity: 150, pricePerKg: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's3', vendorId: 'vendor-1', name: 'Potato', category: 'Vegetables', quantity: 200, pricePerKg: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's4', vendorId: 'vendor-1', name: 'Apple', category: 'Fruits', quantity: 50, pricePerKg: 150, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's5', vendorId: 'vendor-1', name: 'Banana', category: 'Fruits', quantity: 80, pricePerKg: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's6', vendorId: 'vendor-1', name: 'Spinach', category: 'Leafy Greens', quantity: 30, pricePerKg: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
  ],
  orders: [],
  orderCounter: 1000,
};

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password, role } = req.body;
    if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

    const user = db.users.find(u => u.phone === phone && (!role || u.role === role));
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    res.json({ message: 'Login successful', token, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, phone, password, role, shopName, shopAddress, upiId, businessType, deliveryAddress } = req.body;
    if (!name || !phone || !password || !role) return res.status(400).json({ error: 'Name, phone, password, role required' });

    if (db.users.find(u => u.phone === phone && u.role === role)) {
      return res.status(409).json({ error: 'Account already exists' });
    }

    const newUser = {
      id: `${role}-${Date.now()}`,
      name, phone, password: await bcrypt.hash(password, 10), role,
      location: { lat: 17.385, lng: 78.4867, address: shopAddress || deliveryAddress || 'Hyderabad' },
      ...(role === 'vendor' ? { rating: 4.0, shopName, shopAddress, upiId } : { businessType, deliveryAddress }),
    };

    db.users.push(newUser);
    const token = generateToken(newUser);
    const { password: _, ...safe } = newUser;
    res.status(201).json({ message: 'Registration successful', token, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

// STOCK ROUTES
app.get('/api/stock', authenticateToken, (req, res) => {
  const stock = db.stock.filter(s => s.vendorId === req.user.id);
  res.json({ stock, total: stock.length });
});

app.get('/api/stock/all', (req, res) => {
  const { category, search } = req.query;
  let filtered = db.stock.filter(s => s.quantity > 0);
  if (category && category !== 'All') filtered = filtered.filter(s => s.category === category);
  if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const withVendor = filtered.map(s => {
    const vendor = db.users.find(u => u.id === s.vendorId);
    return { ...s, vendorName: vendor?.name || 'Vendor', vendorRating: vendor?.rating || 4.0 };
  });
  res.json({ stock: withVendor, total: withVendor.length });
});

app.post('/api/stock', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Vendors only' });
  const { name, category, quantity, pricePerKg, unit } = req.body;
  const newItem = {
    id: uuidv4(), vendorId: req.user.id, name, category: category || 'Vegetables',
    quantity: Number(quantity), pricePerKg: Number(pricePerKg), unit: unit || 'kg',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', status: 'In Stock', isSurplus: false,
  };
  db.stock.push(newItem);
  res.status(201).json({ message: 'Stock added', item: newItem });
});

app.get('/api/stock/produce-list', (req, res) => {
  res.json({
    produce: [
      { name: 'Tomato', category: 'Vegetables', suggestedPrice: 40 },
      { name: 'Onion', category: 'Vegetables', suggestedPrice: 35 },
      { name: 'Potato', category: 'Vegetables', suggestedPrice: 30 },
      { name: 'Apple', category: 'Fruits', suggestedPrice: 150 },
      { name: 'Banana', category: 'Fruits', suggestedPrice: 50 },
      { name: 'Spinach', category: 'Leafy Greens', suggestedPrice: 40 },
    ]
  });
});

// ORDER ROUTES
app.get('/api/orders', authenticateToken, (req, res) => {
  const orders = req.user.role === 'vendor'
    ? db.orders.filter(o => o.vendorId === req.user.id)
    : db.orders.filter(o => o.businessId === req.user.id);
  res.json({ orders, total: orders.length });
});

app.post('/api/orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'business') return res.status(403).json({ error: 'Business only' });
  const { vendorId, items } = req.body;
  if (!vendorId || !items?.length) return res.status(400).json({ error: 'Vendor and items required' });

  const vendor = db.users.find(u => u.id === vendorId);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  const total = items.reduce((s, i) => s + (i.pricePerKg || i.price || 0) * i.quantity, 0);
  db.orderCounter++;

  const newOrder = {
    id: `ORD-${db.orderCounter}`, vendorId, vendorName: vendor.name, vendorUpiId: vendor.upiId || '',
    businessId: req.user.id, buyerName: req.user.name, items, total, totalAmount: total,
    status: 'pending', createdAt: new Date().toISOString(),
  };
  db.orders.push(newOrder);
  res.status(201).json({ message: 'Order placed', order: newOrder });
});

app.put('/api/orders/:id/status', authenticateToken, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  res.json({ message: 'Status updated', order });
});

app.get('/api/orders/stats', authenticateToken, (req, res) => {
  const orders = req.user.role === 'vendor'
    ? db.orders.filter(o => o.vendorId === req.user.id)
    : db.orders.filter(o => o.businessId === req.user.id);
  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
  });
});

// MATCHING
app.get('/api/matching/nearby-vendors', (req, res) => {
  const vendors = db.users.filter(u => u.role === 'vendor').map(v => ({
    vendorId: v.id, vendorName: v.name, rating: v.rating, distance: 2.5,
    items: db.stock.filter(s => s.vendorId === v.id).slice(0, 3).map(s => ({
      name: s.name, price: s.pricePerKg, unit: s.unit
    }))
  }));
  res.json({ vendors });
});

app.post('/api/matching/find', authenticateToken, (req, res) => {
  const { requirements } = req.body;
  const matches = requirements?.map(r => ({
    item: r.name, matches: db.stock.filter(s => s.name.toLowerCase().includes(r.name.toLowerCase()))
  })) || [];
  res.json({ matches, totalCost: 0, deliveryCost: 50, grandTotal: 50 });
});

// OTHER ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), name: 'FreshLink API' });
});

app.get('/api/areas', (req, res) => {
  res.json({ city: 'Hyderabad', areas: [
    { name: 'Madhapur', zone: 'West', active: true },
    { name: 'Gachibowli', zone: 'West', active: true },
    { name: 'Hitech City', zone: 'West', active: true },
  ]});
});

// Catch-all for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = app;
