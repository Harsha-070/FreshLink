// FreshLink API - Demo Mode (No Authentication Required)

// Demo data
const db = {
  stock: [
    { id: 's1', vendorId: 'vendor-demo', name: 'Tomato', category: 'Vegetables', quantity: 100, pricePerKg: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's2', vendorId: 'vendor-demo', name: 'Onion', category: 'Vegetables', quantity: 150, pricePerKg: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's3', vendorId: 'vendor-demo', name: 'Potato', category: 'Vegetables', quantity: 200, pricePerKg: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's4', vendorId: 'vendor-demo', name: 'Carrot', category: 'Vegetables', quantity: 80, pricePerKg: 45, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's5', vendorId: 'vendor-demo', name: 'Cabbage', category: 'Vegetables', quantity: 60, pricePerKg: 25, unit: 'kg', image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's6', vendorId: 'vendor-demo', name: 'Cauliflower', category: 'Vegetables', quantity: 40, pricePerKg: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's7', vendorId: 'vendor-demo', name: 'Apple', category: 'Fruits', quantity: 50, pricePerKg: 150, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's8', vendorId: 'vendor-demo', name: 'Banana', category: 'Fruits', quantity: 80, pricePerKg: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's9', vendorId: 'vendor-demo', name: 'Orange', category: 'Fruits', quantity: 70, pricePerKg: 80, unit: 'kg', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's10', vendorId: 'vendor-demo', name: 'Mango', category: 'Fruits', quantity: 30, pricePerKg: 120, unit: 'kg', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's11', vendorId: 'vendor-demo', name: 'Spinach', category: 'Leafy Greens', quantity: 30, pricePerKg: 40, unit: 'bunch', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's12', vendorId: 'vendor-demo', name: 'Coriander', category: 'Leafy Greens', quantity: 50, pricePerKg: 30, unit: 'bunch', image: 'https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's13', vendorId: 'vendor-demo', name: 'Dragon Fruit', category: 'Exotic', quantity: 20, pricePerKg: 250, unit: 'kg', image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
    { id: 's14', vendorId: 'vendor-demo', name: 'Kiwi', category: 'Exotic', quantity: 25, pricePerKg: 200, unit: 'kg', image: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=300&h=300&fit=crop', status: 'In Stock', isSurplus: false },
  ],
  orders: [],
};

const DEMO_VENDOR = {
  id: 'vendor-demo',
  name: 'Fresh Farms Vendor',
  role: 'vendor',
  rating: 4.5,
  shopName: 'Fresh Farms',
  upiId: 'freshfarms@upi',
};

const DEMO_BUSINESS = {
  id: 'business-demo',
  name: 'Hotel Grand Kitchen',
  role: 'business',
};

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
      return res.status(200).json({ status: 'ok', mode: 'demo', stock: db.stock.length });
    }

    // Auth endpoints - return demo users
    if (path === '/api/auth/login' && method === 'POST') {
      const { role } = req.body || {};
      const user = role === 'vendor' ? DEMO_VENDOR : DEMO_BUSINESS;
      return res.status(200).json({ message: 'Login successful', token: 'demo-token', user });
    }

    if (path === '/api/auth/register' && method === 'POST') {
      const { role } = req.body || {};
      const user = role === 'vendor' ? DEMO_VENDOR : DEMO_BUSINESS;
      return res.status(201).json({ message: 'Registration successful', token: 'demo-token', user });
    }

    if (path === '/api/auth/me') {
      return res.status(200).json({ user: DEMO_VENDOR });
    }

    // GET ALL STOCK (public)
    if (path === '/api/stock/all') {
      const { category } = req.query || {};
      let stock = db.stock.filter(s => s.quantity > 0);
      if (category && category !== 'All') {
        stock = stock.filter(s => s.category === category);
      }
      const withVendor = stock.map(s => ({
        ...s,
        vendorName: 'Fresh Farms',
        vendorRating: 4.5,
        vendorAddress: 'Madhapur, Hyderabad'
      }));
      return res.status(200).json({ stock: withVendor, total: withVendor.length });
    }

    // GET MY STOCK (vendor)
    if (path === '/api/stock' && method === 'GET') {
      const stock = db.stock.filter(s => s.vendorId === 'vendor-demo');
      return res.status(200).json({ stock, total: stock.length });
    }

    // ADD STOCK
    if (path === '/api/stock' && method === 'POST') {
      const { name, category, quantity, pricePerKg, unit } = req.body || {};
      const newItem = {
        id: `s${Date.now()}`,
        vendorId: 'vendor-demo',
        name: name || 'New Item',
        category: category || 'Vegetables',
        quantity: Number(quantity) || 10,
        pricePerKg: Number(pricePerKg) || 50,
        unit: unit || 'kg',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=300&fit=crop',
        status: 'In Stock',
        isSurplus: false,
      };
      db.stock.push(newItem);
      return res.status(201).json({ message: 'Stock added', item: newItem });
    }

    // UPDATE STOCK
    if (path.match(/^\/api\/stock\/[^/]+$/) && method === 'PUT') {
      const id = path.split('/')[3];
      const item = db.stock.find(s => s.id === id);
      if (item) {
        const { quantity, pricePerKg } = req.body || {};
        if (quantity !== undefined) item.quantity = Number(quantity);
        if (pricePerKg !== undefined) item.pricePerKg = Number(pricePerKg);
        return res.status(200).json({ message: 'Stock updated', item });
      }
      return res.status(404).json({ error: 'Stock not found' });
    }

    // DELETE STOCK
    if (path.match(/^\/api\/stock\/[^/]+$/) && method === 'DELETE') {
      const id = path.split('/')[3];
      const idx = db.stock.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.stock.splice(idx, 1);
        return res.status(200).json({ message: 'Stock deleted' });
      }
      return res.status(404).json({ error: 'Stock not found' });
    }

    // PRODUCE LIST
    if (path === '/api/stock/produce-list' || path === '/api/produce') {
      return res.status(200).json({
        produce: [
          { id: 'p1', name: 'Tomato', category: 'Vegetables', suggestedPrice: 40, minPrice: 30, maxPrice: 60, unit: 'kg' },
          { id: 'p2', name: 'Onion', category: 'Vegetables', suggestedPrice: 35, minPrice: 25, maxPrice: 50, unit: 'kg' },
          { id: 'p3', name: 'Potato', category: 'Vegetables', suggestedPrice: 30, minPrice: 20, maxPrice: 45, unit: 'kg' },
          { id: 'p4', name: 'Carrot', category: 'Vegetables', suggestedPrice: 45, minPrice: 35, maxPrice: 60, unit: 'kg' },
          { id: 'p5', name: 'Apple', category: 'Fruits', suggestedPrice: 150, minPrice: 120, maxPrice: 200, unit: 'kg' },
          { id: 'p6', name: 'Banana', category: 'Fruits', suggestedPrice: 50, minPrice: 40, maxPrice: 70, unit: 'kg' },
          { id: 'p7', name: 'Orange', category: 'Fruits', suggestedPrice: 80, minPrice: 60, maxPrice: 100, unit: 'kg' },
          { id: 'p8', name: 'Spinach', category: 'Leafy Greens', suggestedPrice: 40, minPrice: 30, maxPrice: 50, unit: 'bunch' },
        ],
        total: 8
      });
    }

    // GET ORDERS
    if (path === '/api/orders' && method === 'GET') {
      return res.status(200).json({ orders: db.orders, total: db.orders.length });
    }

    // CREATE ORDER
    if (path === '/api/orders' && method === 'POST') {
      const { vendorId, items } = req.body || {};
      const total = (items || []).reduce((s, i) => s + (i.pricePerKg || i.price || 0) * (i.quantity || 1), 0);

      const newOrder = {
        id: `ORD-${Date.now()}`,
        vendorId: vendorId || 'vendor-demo',
        vendorName: 'Fresh Farms',
        vendorUpiId: 'freshfarms@upi',
        businessId: 'business-demo',
        buyerName: 'Hotel Grand Kitchen',
        items: items || [],
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
      return res.status(200).json({
        totalOrders: db.orders.length,
        pendingOrders: db.orders.filter(o => o.status === 'pending').length,
        totalRevenue: db.orders.reduce((s, o) => s + (o.total || 0), 0),
      });
    }

    // UPDATE ORDER STATUS
    if (path.match(/^\/api\/orders\/[^/]+\/status$/) && method === 'PUT') {
      const orderId = path.split('/')[3];
      const { status } = req.body || {};
      const order = db.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        return res.status(200).json({ message: 'Status updated', order });
      }
      return res.status(404).json({ error: 'Order not found' });
    }

    // NEARBY VENDORS
    if (path === '/api/matching/nearby-vendors') {
      return res.status(200).json({
        vendors: [{
          vendorId: 'vendor-demo',
          vendorName: 'Fresh Farms',
          rating: 4.5,
          distance: 2.5,
          address: 'Madhapur, Hyderabad',
          items: db.stock.slice(0, 3).map(s => ({ name: s.name, price: s.pricePerKg, unit: s.unit, image: s.image }))
        }]
      });
    }

    // MATCHING
    if (path === '/api/matching/find' && method === 'POST') {
      const { requirements } = req.body || {};
      const results = (requirements || []).map(r => ({
        item: r.name,
        quantityNeeded: r.quantity,
        matches: db.stock.filter(s => s.name.toLowerCase().includes((r.name || '').toLowerCase())).map(s => ({
          vendorId: 'vendor-demo',
          vendorName: 'Fresh Farms',
          stockId: s.id,
          availableQty: s.quantity,
          pricePerKg: s.pricePerKg,
          distance: 2.5
        }))
      }));
      return res.status(200).json({ results, fulfillmentPlan: { items: results, grandTotal: 500 } });
    }

    // SURPLUS
    if (path === '/api/surplus' || path === '/api/surplus/my') {
      const surplus = db.stock.filter(s => s.isSurplus);
      return res.status(200).json({ surplus, stats: { nearExpiry: surplus.length, foodSavedKg: 50 } });
    }

    // MARK AS SURPLUS
    if (path.match(/^\/api\/stock\/[^/]+\/surplus$/) && method === 'POST') {
      const id = path.split('/')[3];
      const item = db.stock.find(s => s.id === id);
      if (item) {
        item.isSurplus = true;
        item.discountPrice = Math.round(item.pricePerKg * 0.7);
        return res.status(200).json({ message: 'Marked as surplus', item });
      }
      return res.status(404).json({ error: 'Stock not found' });
    }

    // COLD STORAGE
    if (path === '/api/cold-storage') {
      return res.status(200).json({
        facilities: [
          { id: 'cs1', name: 'ColdZone Madhapur', location: 'Madhapur', capacity: 500, available: 200, pricePerKg: 2 },
          { id: 'cs2', name: 'FreshStore Gachibowli', location: 'Gachibowli', capacity: 800, available: 350, pricePerKg: 1.5 },
        ]
      });
    }

    // AREAS
    if (path === '/api/areas') {
      return res.status(200).json({
        city: 'Hyderabad',
        areas: [
          { name: 'Madhapur', zone: 'West', active: true },
          { name: 'Gachibowli', zone: 'West', active: true },
          { name: 'Kondapur', zone: 'West', active: true },
          { name: 'Hitech City', zone: 'West', active: true },
          { name: 'Jubilee Hills', zone: 'Central', active: true },
          { name: 'Banjara Hills', zone: 'Central', active: true },
        ]
      });
    }

    // 404
    return res.status(404).json({ error: 'Not found', path });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
};
