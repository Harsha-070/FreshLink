const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'freshlink-pro-secret-2026';
const MONGODB_URI = process.env.MONGODB_URI;

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!MONGODB_URI) return null;

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedDb = client.db('freshlink');
  return cachedDb;
}

function generateToken(user) {
  return jwt.sign({ id: user._id?.toString() || user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(authHeader) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

// Fallback in-memory DB (for when MongoDB not configured)
const memDb = {
  users: [],
  stock: [
    { id: 's1', vendorId: 'vendor-1', name: 'Tomato', category: 'Vegetables', quantity: 100, pricePerKg: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's2', vendorId: 'vendor-1', name: 'Onion', category: 'Vegetables', quantity: 150, pricePerKg: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's3', vendorId: 'vendor-1', name: 'Apple', category: 'Fruits', quantity: 50, pricePerKg: 150, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
  ],
  orders: [],
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url, method } = req;
  const path = url.split('?')[0];

  let db = null;
  try {
    db = await connectToDatabase();
  } catch (e) {
    console.log('MongoDB not available, using memory');
  }

  try {
    // AUTH: Login
    if (path === '/api/auth/login' && method === 'POST') {
      const { phone, password, role } = req.body || {};
      if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

      let user;
      if (db) {
        user = await db.collection('users').findOne({ phone, ...(role ? { role } : {}) });
      } else {
        user = memDb.users.find(u => u.phone === phone && (!role || u.role === role));
      }

      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const { password: _, ...safe } = user;
      safe.id = safe._id?.toString() || safe.id;
      return res.json({ message: 'Login successful', token: generateToken(user), user: safe });
    }

    // AUTH: Register
    if (path === '/api/auth/register' && method === 'POST') {
      const { name, phone, password, role, shopName, shopAddress, upiId, businessType, deliveryAddress } = req.body || {};
      if (!name || !phone || !password || !role) return res.status(400).json({ error: 'Name, phone, password, role required' });

      // Check if exists
      let existing;
      if (db) {
        existing = await db.collection('users').findOne({ phone, role });
      } else {
        existing = memDb.users.find(u => u.phone === phone && u.role === role);
      }
      if (existing) return res.status(409).json({ error: 'Account already exists with this phone number' });

      const newUser = {
        id: `${role}-${Date.now()}`,
        name, phone,
        password: await bcrypt.hash(password, 10),
        role,
        location: { lat: 17.385, lng: 78.487, address: shopAddress || deliveryAddress || 'Hyderabad' },
        createdAt: new Date().toISOString(),
        ...(role === 'vendor' ? { rating: 4.0, shopName: shopName || '', shopAddress: shopAddress || '', upiId: upiId || '' } : { businessType: businessType || 'Restaurant', deliveryAddress: deliveryAddress || '' }),
      };

      if (db) {
        const result = await db.collection('users').insertOne(newUser);
        newUser._id = result.insertedId;
      } else {
        memDb.users.push(newUser);
      }

      const { password: _, ...safe } = newUser;
      safe.id = safe._id?.toString() || safe.id;
      return res.status(201).json({ message: 'Registration successful', token: generateToken(newUser), user: safe });
    }

    // AUTH: Me
    if (path === '/api/auth/me' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      let user;
      if (db) {
        const { ObjectId } = require('mongodb');
        try {
          user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
        } catch {
          user = await db.collection('users').findOne({ id: decoded.id });
        }
      } else {
        user = memDb.users.find(u => u.id === decoded.id);
      }

      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password: _, ...safe } = user;
      safe.id = safe._id?.toString() || safe.id;
      return res.json({ user: safe });
    }

    // STOCK: Get all (public)
    if (path === '/api/stock/all' && method === 'GET') {
      let stock;
      if (db) {
        stock = await db.collection('stock').find({ quantity: { $gt: 0 } }).toArray();
      } else {
        stock = memDb.stock.filter(s => s.quantity > 0);
      }

      const withVendor = await Promise.all(stock.map(async s => {
        let vendor;
        if (db) {
          const { ObjectId } = require('mongodb');
          try { vendor = await db.collection('users').findOne({ _id: new ObjectId(s.vendorId) }); } catch {}
          if (!vendor) vendor = await db.collection('users').findOne({ id: s.vendorId });
        } else {
          vendor = memDb.users.find(u => u.id === s.vendorId);
        }
        return { ...s, id: s._id?.toString() || s.id, vendorName: vendor?.name || 'Vendor', vendorRating: vendor?.rating || 4.0 };
      }));

      return res.json({ stock: withVendor, total: withVendor.length });
    }

    // STOCK: Get my stock
    if (path === '/api/stock' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      let stock;
      if (db) {
        stock = await db.collection('stock').find({ vendorId: decoded.id }).toArray();
      } else {
        stock = memDb.stock.filter(s => s.vendorId === decoded.id);
      }
      return res.json({ stock: stock.map(s => ({ ...s, id: s._id?.toString() || s.id })), total: stock.length });
    }

    // STOCK: Add
    if (path === '/api/stock' && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded || decoded.role !== 'vendor') return res.status(403).json({ error: 'Vendors only' });

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
        status: 'In Stock',
        isSurplus: false,
        createdAt: new Date().toISOString(),
      };

      if (db) {
        await db.collection('stock').insertOne(newItem);
      } else {
        memDb.stock.push(newItem);
      }
      return res.status(201).json({ message: 'Stock added', item: newItem });
    }

    // STOCK: Produce list
    if (path === '/api/stock/produce-list' && method === 'GET') {
      return res.json({ produce: [
        { name: 'Tomato', category: 'Vegetables', suggestedPrice: 40, unit: 'kg' },
        { name: 'Onion', category: 'Vegetables', suggestedPrice: 35, unit: 'kg' },
        { name: 'Potato', category: 'Vegetables', suggestedPrice: 30, unit: 'kg' },
        { name: 'Apple', category: 'Fruits', suggestedPrice: 150, unit: 'kg' },
        { name: 'Banana', category: 'Fruits', suggestedPrice: 50, unit: 'kg' },
        { name: 'Spinach', category: 'Leafy Greens', suggestedPrice: 40, unit: 'bunch' },
      ]});
    }

    // ORDERS: Get
    if (path === '/api/orders' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      let orders;
      if (db) {
        const filter = decoded.role === 'vendor' ? { vendorId: decoded.id } : { businessId: decoded.id };
        orders = await db.collection('orders').find(filter).sort({ createdAt: -1 }).toArray();
      } else {
        orders = decoded.role === 'vendor'
          ? memDb.orders.filter(o => o.vendorId === decoded.id)
          : memDb.orders.filter(o => o.businessId === decoded.id);
      }
      return res.json({ orders: orders.map(o => ({ ...o, id: o._id?.toString() || o.id })), total: orders.length });
    }

    // ORDERS: Create
    if (path === '/api/orders' && method === 'POST') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded || decoded.role !== 'business') return res.status(403).json({ error: 'Business only' });

      const { vendorId, items } = req.body || {};
      if (!vendorId || !items?.length) return res.status(400).json({ error: 'Vendor and items required' });

      let vendor;
      if (db) {
        const { ObjectId } = require('mongodb');
        try { vendor = await db.collection('users').findOne({ _id: new ObjectId(vendorId) }); } catch {}
        if (!vendor) vendor = await db.collection('users').findOne({ id: vendorId });
      } else {
        vendor = memDb.users.find(u => u.id === vendorId);
      }
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

      const total = items.reduce((s, i) => s + (i.pricePerKg || i.price || 0) * i.quantity, 0);
      const newOrder = {
        id: `ORD-${Date.now()}`,
        vendorId: vendor._id?.toString() || vendor.id,
        vendorName: vendor.name,
        vendorUpiId: vendor.upiId || '',
        businessId: decoded.id,
        buyerName: decoded.name,
        items,
        total: Math.round(total),
        totalAmount: Math.round(total),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      if (db) {
        await db.collection('orders').insertOne(newOrder);
      } else {
        memDb.orders.push(newOrder);
      }
      return res.status(201).json({ message: 'Order placed', order: newOrder });
    }

    // ORDERS: Update status
    if (path.match(/^\/api\/orders\/[^/]+\/status$/) && method === 'PUT') {
      const orderId = path.split('/')[3];
      const { status } = req.body || {};

      if (db) {
        const { ObjectId } = require('mongodb');
        try {
          await db.collection('orders').updateOne({ _id: new ObjectId(orderId) }, { $set: { status } });
        } catch {
          await db.collection('orders').updateOne({ id: orderId }, { $set: { status } });
        }
      } else {
        const order = memDb.orders.find(o => o.id === orderId);
        if (order) order.status = status;
      }
      return res.json({ message: 'Status updated' });
    }

    // ORDERS: Stats
    if (path === '/api/orders/stats' && method === 'GET') {
      const decoded = verifyToken(req.headers.authorization);
      if (!decoded) return res.status(401).json({ error: 'Unauthorized' });

      let orders;
      if (db) {
        const filter = decoded.role === 'vendor' ? { vendorId: decoded.id } : { businessId: decoded.id };
        orders = await db.collection('orders').find(filter).toArray();
      } else {
        orders = decoded.role === 'vendor'
          ? memDb.orders.filter(o => o.vendorId === decoded.id)
          : memDb.orders.filter(o => o.businessId === decoded.id);
      }
      return res.json({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalRevenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0),
      });
    }

    // MATCHING: Nearby vendors
    if (path === '/api/matching/nearby-vendors' && method === 'GET') {
      let vendors;
      if (db) {
        vendors = await db.collection('users').find({ role: 'vendor' }).toArray();
      } else {
        vendors = memDb.users.filter(u => u.role === 'vendor');
      }

      const result = await Promise.all(vendors.map(async v => {
        let stock;
        if (db) {
          stock = await db.collection('stock').find({ vendorId: v._id?.toString() || v.id }).limit(3).toArray();
        } else {
          stock = memDb.stock.filter(s => s.vendorId === v.id).slice(0, 3);
        }
        return {
          vendorId: v._id?.toString() || v.id,
          vendorName: v.name,
          rating: v.rating || 4.0,
          distance: 2.5,
          items: stock.map(s => ({ name: s.name, price: s.pricePerKg, unit: s.unit }))
        };
      }));
      return res.json({ vendors: result });
    }

    // HEALTH
    if (path === '/api/health') {
      return res.json({ status: 'ok', database: db ? 'mongodb' : 'memory', timestamp: new Date().toISOString() });
    }

    // Not found
    return res.status(404).json({ error: 'API endpoint not found', path });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
