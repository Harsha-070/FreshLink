const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'freshlink-pro-secret-2026';

// In-memory database (persists during warm instances)
const db = {
  users: [],
  stock: [
    { id: 's1', vendorId: 'vendor-1', name: 'Tomato', category: 'Vegetables', quantity: 100, pricePerKg: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop' },
    { id: 's2', vendorId: 'vendor-1', name: 'Onion', category: 'Vegetables', quantity: 150, pricePerKg: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop' },
    { id: 's3', vendorId: 'vendor-1', name: 'Potato', category: 'Vegetables', quantity: 200, pricePerKg: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=300&h=300&fit=crop' },
    { id: 's4', vendorId: 'vendor-1', name: 'Apple', category: 'Fruits', quantity: 50, pricePerKg: 150, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop' },
    { id: 's5', vendorId: 'vendor-1', name: 'Banana', category: 'Fruits', quantity: 80, pricePerKg: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop' },
  ],
  orders: [],
};

function generateToken(user) {
  return jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(auth) {
  if (!auth) return null;
  try { return jwt.verify(auth.split(' ')[1], JWT_SECRET); }
  catch { return null; }
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.split('?')[0];
  const method = req.method;

  try {
    // Health check
    if (path === '/api/health' || path === '/api') {
      return res.status(200).json({ status: 'ok', users: db.users.length });
    }

    // LOGIN
    if (path === '/api/auth/login' && method === 'POST') {
      const { phone, password, role } = req.body || {};
      if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password required' });
      }

      const user = db.users.find(u => u.phone === phone && (!role || u.role === role));
      if (!user) {
        return res.status(401).json({ error: 'Invalid phone number or password' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid phone number or password' });
      }

      const { password: _, ...safe } = user;
      return res.status(200).json({
        message: 'Login successful',
        token: generateToken(user),
        user: safe
      });
    }

    // REGISTER
    if (path === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, role, shopName, shopAddress, upiId, businessType, deliveryAddress } = req.body || {};

      if (!name || !phone || !password || !role) {
        return res.status(400).json({ error: 'Name, phone, password, and role are required' });
      }

      if (db.users.find(u => u.phone === phone && u.role === role)) {
        return res.status(409).json({ error: 'Account already exists with this phone number' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: `${role}-${Date.now()}`,
        name,
        phone,
        password: hashedPassword,
        role,
        location: { lat: 17.385, lng: 78.487, address: shopAddress || deliveryAddress || 'Hyderabad' },
        ...(role === 'vendor'
          ? { rating: 4.0, shopName: shopName || '', shopAddress: shopAddress || '', upiId: upiId || '' }
          : { businessType: businessType || 'Restaurant', deliveryAddress: deliveryAddress || '' }
        ),
      };

      db.users.push(newUser);

      const { password: _, ...safe } = newUser;
      return res.status(201).json({
        message: 'Registration successful',
        token: generateToken(newUser),
        user: safe
      });
    }

    // GET ME
    if (path === '/api/auth/me' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      const user = db.users.find(u => u.id === decoded.id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const { password: _, ...safe } = user;
      return res.status(200).json({ user: safe });
    }

    // GET ALL STOCK
    if (path === '/api/stock/all' && method === 'GET') {
      const stock = db.stock.filter(s => s.quantity > 0).map(s => {
        const vendor = db.users.find(u => u.id === s.vendorId);
        return { ...s, vendorName: vendor?.name || 'Fresh Farms', vendorRating: vendor?.rating || 4.5 };
      });
      return res.status(200).json({ stock, total: stock.length });
    }

    // GET MY STOCK
    if (path === '/api/stock' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      const stock = db.stock.filter(s => s.vendorId === decoded.id);
      return res.status(200).json({ stock, total: stock.length });
    }

    // ADD STOCK
    if (path === '/api/stock' && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded || decoded.role !== 'vendor') {
        return res.status(403).json({ error: 'Only vendors can add stock' });
      }

      const { name, category, quantity, pricePerKg, unit } = req.body || {};
      const newItem = {
        id: `s${Date.now()}`,
        vendorId: decoded.id,
        name,
        category: category || 'Vegetables',
        quantity: Number(quantity) || 0,
        pricePerKg: Number(pricePerKg) || 0,
        unit: unit || 'kg',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      };

      db.stock.push(newItem);
      return res.status(201).json({ message: 'Stock added', item: newItem });
    }

    // PRODUCE LIST
    if (path === '/api/stock/produce-list') {
      return res.status(200).json({
        produce: [
          { name: 'Tomato', category: 'Vegetables', suggestedPrice: 40 },
          { name: 'Onion', category: 'Vegetables', suggestedPrice: 35 },
          { name: 'Potato', category: 'Vegetables', suggestedPrice: 30 },
          { name: 'Apple', category: 'Fruits', suggestedPrice: 150 },
          { name: 'Banana', category: 'Fruits', suggestedPrice: 50 },
        ]
      });
    }

    // GET ORDERS
    if (path === '/api/orders' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      const orders = decoded.role === 'vendor'
        ? db.orders.filter(o => o.vendorId === decoded.id)
        : db.orders.filter(o => o.businessId === decoded.id);

      return res.status(200).json({ orders, total: orders.length });
    }

    // CREATE ORDER
    if (path === '/api/orders' && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded || decoded.role !== 'business') {
        return res.status(403).json({ error: 'Only businesses can create orders' });
      }

      const { vendorId, items } = req.body || {};
      if (!vendorId || !items?.length) {
        return res.status(400).json({ error: 'Vendor and items required' });
      }

      const vendor = db.users.find(u => u.id === vendorId);
      const total = items.reduce((s, i) => s + (i.pricePerKg || i.price || 0) * i.quantity, 0);

      const newOrder = {
        id: `ORD-${Date.now()}`,
        vendorId,
        vendorName: vendor?.name || 'Vendor',
        vendorUpiId: vendor?.upiId || '',
        businessId: decoded.id,
        buyerName: decoded.name,
        items,
        total: Math.round(total),
        totalAmount: Math.round(total),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      db.orders.push(newOrder);
      return res.status(201).json({ message: 'Order placed', order: newOrder });
    }

    // ORDER STATS
    if (path === '/api/orders/stats') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      const orders = decoded.role === 'vendor'
        ? db.orders.filter(o => o.vendorId === decoded.id)
        : db.orders.filter(o => o.businessId === decoded.id);

      return res.status(200).json({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.reduce((s, o) => s + (o.total || 0), 0),
      });
    }

    // NEARBY VENDORS
    if (path === '/api/matching/nearby-vendors') {
      const vendors = db.users.filter(u => u.role === 'vendor').map(v => ({
        vendorId: v.id,
        vendorName: v.name,
        rating: v.rating || 4.0,
        distance: 2.5,
        items: db.stock.filter(s => s.vendorId === v.id).slice(0, 3),
      }));
      return res.status(200).json({ vendors });
    }

    // 404
    return res.status(404).json({ error: 'Not found', path });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
};
