const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'freshlink-pro-secret-2026';

// In-memory database
const db = {
  users: [
    {
      id: 'vendor-1', name: 'Fresh Farms Vendor', phone: '9876543210',
      password: '$2a$10$xVqYLGrwC5Hn5ULhMd5LyeUXdQKzLGVPfhGmBJkXWcKCFpCRiRLHi',
      role: 'vendor', rating: 4.5, shopName: 'Fresh Farms', shopAddress: 'Madhapur, Hyderabad',
      upiId: 'freshfarms@upi', location: { lat: 17.44, lng: 78.35, address: 'Madhapur' },
    },
    {
      id: 'business-1', name: 'Hotel Grand Kitchen', phone: '9988776655',
      password: '$2a$10$xVqYLGrwC5Hn5ULhMd5LyeUXdQKzLGVPfhGmBJkXWcKCFpCRiRLHi',
      role: 'business', businessType: 'Restaurant', deliveryAddress: 'Jubilee Hills',
      location: { lat: 17.43, lng: 78.41, address: 'Jubilee Hills' },
    },
  ],
  stock: [
    { id: 's1', vendorId: 'vendor-1', name: 'Tomato', category: 'Vegetables', quantity: 100, pricePerKg: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's2', vendorId: 'vendor-1', name: 'Onion', category: 'Vegetables', quantity: 150, pricePerKg: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's3', vendorId: 'vendor-1', name: 'Potato', category: 'Vegetables', quantity: 200, pricePerKg: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's4', vendorId: 'vendor-1', name: 'Apple', category: 'Fruits', quantity: 50, pricePerKg: 150, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's5', vendorId: 'vendor-1', name: 'Banana', category: 'Fruits', quantity: 80, pricePerKg: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
  ],
  orders: [],
  orderCounter: 1000,
};

function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;
  const path = url.split('?')[0];

  try {
    // AUTH: Login
    if (path === '/api/auth/login' && method === 'POST') {
      const { phone, password, role } = req.body || {};
      if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });
      const user = db.users.find(u => u.phone === phone && (!role || u.role === role));
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
      const { password: _, ...safe } = user;
      return res.json({ message: 'Login successful', token: generateToken(user), user: safe });
    }

    // AUTH: Register
    if (path === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, role, shopName, shopAddress, upiId, businessType, deliveryAddress } = req.body || {};
      if (!name || !phone || !password || !role) return res.status(400).json({ error: 'Name, phone, password, role required' });
      if (db.users.find(u => u.phone === phone && u.role === role)) return res.status(409).json({ error: 'Account exists' });
      const newUser = {
        id: `${role}-${Date.now()}`, name, phone, password: await bcrypt.hash(password, 10), role,
        location: { lat: 17.385, lng: 78.487, address: shopAddress || deliveryAddress || 'Hyderabad' },
        ...(role === 'vendor' ? { rating: 4.0, shopName, shopAddress, upiId } : { businessType, deliveryAddress }),
      };
      db.users.push(newUser);
      const { password: _, ...safe } = newUser;
      return res.status(201).json({ message: 'Registration successful', token: generateToken(newUser), user: safe });
    }

    // AUTH: Me
    if (path === '/api/auth/me' && method === 'GET') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const found = db.users.find(u => u.id === user.id);
      if (!found) return res.status(404).json({ error: 'User not found' });
      const { password: _, ...safe } = found;
      return res.json({ user: safe });
    }

    // STOCK: Get all
    if (path === '/api/stock/all' && method === 'GET') {
      const withVendor = db.stock.filter(s => s.quantity > 0).map(s => {
        const vendor = db.users.find(u => u.id === s.vendorId);
        return { ...s, vendorName: vendor?.name || 'Vendor', vendorRating: vendor?.rating || 4.0 };
      });
      return res.json({ stock: withVendor, total: withVendor.length });
    }

    // STOCK: Get my stock
    if (path === '/api/stock' && method === 'GET') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const stock = db.stock.filter(s => s.vendorId === user.id);
      return res.json({ stock, total: stock.length });
    }

    // STOCK: Produce list
    if (path === '/api/stock/produce-list' && method === 'GET') {
      return res.json({ produce: [
        { name: 'Tomato', category: 'Vegetables', suggestedPrice: 40 },
        { name: 'Onion', category: 'Vegetables', suggestedPrice: 35 },
        { name: 'Potato', category: 'Vegetables', suggestedPrice: 30 },
        { name: 'Apple', category: 'Fruits', suggestedPrice: 150 },
        { name: 'Banana', category: 'Fruits', suggestedPrice: 50 },
      ]});
    }

    // STOCK: Add
    if (path === '/api/stock' && method === 'POST') {
      const user = verifyToken(req.headers.authorization);
      if (!user || user.role !== 'vendor') return res.status(403).json({ error: 'Vendors only' });
      const { name, category, quantity, pricePerKg, unit } = req.body || {};
      const newItem = {
        id: `s${Date.now()}`, vendorId: user.id, name, category: category || 'Vegetables',
        quantity: Number(quantity), pricePerKg: Number(pricePerKg), unit: unit || 'kg',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', status: 'In Stock', isSurplus: false,
      };
      db.stock.push(newItem);
      return res.status(201).json({ message: 'Stock added', item: newItem });
    }

    // ORDERS: Get
    if (path === '/api/orders' && method === 'GET') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const orders = user.role === 'vendor' ? db.orders.filter(o => o.vendorId === user.id) : db.orders.filter(o => o.businessId === user.id);
      return res.json({ orders, total: orders.length });
    }

    // ORDERS: Create
    if (path === '/api/orders' && method === 'POST') {
      const user = verifyToken(req.headers.authorization);
      if (!user || user.role !== 'business') return res.status(403).json({ error: 'Business only' });
      const { vendorId, items } = req.body || {};
      if (!vendorId || !items?.length) return res.status(400).json({ error: 'Vendor and items required' });
      const vendor = db.users.find(u => u.id === vendorId);
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
      const total = items.reduce((s, i) => s + (i.pricePerKg || i.price || 0) * i.quantity, 0);
      db.orderCounter++;
      const newOrder = {
        id: `ORD-${db.orderCounter}`, vendorId, vendorName: vendor.name, vendorUpiId: vendor.upiId || '',
        businessId: user.id, buyerName: user.name, items, total, totalAmount: total,
        status: 'pending', createdAt: new Date().toISOString(),
      };
      db.orders.push(newOrder);
      return res.status(201).json({ message: 'Order placed', order: newOrder });
    }

    // ORDERS: Stats
    if (path === '/api/orders/stats' && method === 'GET') {
      const user = verifyToken(req.headers.authorization);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const orders = user.role === 'vendor' ? db.orders.filter(o => o.vendorId === user.id) : db.orders.filter(o => o.businessId === user.id);
      return res.json({ totalOrders: orders.length, pendingOrders: orders.filter(o => o.status === 'pending').length, totalRevenue: 0 });
    }

    // MATCHING: Nearby vendors
    if (path === '/api/matching/nearby-vendors' && method === 'GET') {
      const vendors = db.users.filter(u => u.role === 'vendor').map(v => ({
        vendorId: v.id, vendorName: v.name, rating: v.rating, distance: 2.5,
        items: db.stock.filter(s => s.vendorId === v.id).slice(0, 3).map(s => ({ name: s.name, price: s.pricePerKg, unit: s.unit }))
      }));
      return res.json({ vendors });
    }

    // HEALTH
    if (path === '/api/health') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Not found
    return res.status(404).json({ error: 'API endpoint not found' });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
