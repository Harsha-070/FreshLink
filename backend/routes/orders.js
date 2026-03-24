const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

// GET /api/orders
router.get('/', authenticateToken, (req, res) => {
  const { status } = req.query;
  let userOrders;

  if (req.user.role === 'vendor') {
    userOrders = db.orders.filter((o) => o.vendorId === req.user.id);
  } else {
    userOrders = db.orders.filter((o) => o.businessId === req.user.id);
  }

  if (status && status !== 'all') {
    userOrders = userOrders.filter((o) => o.status === status);
  }

  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders: userOrders, total: userOrders.length });
});

// POST /api/orders
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'business') return res.status(403).json({ error: 'Only business users can place orders' });

  const { vendorId, items, deliveryAddress } = req.body;
  if (!vendorId || !items || items.length === 0) return res.status(400).json({ error: 'Vendor and items required' });

  const vendor = db.users.find((u) => u.id === vendorId);
  if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

  const business = db.users.find((u) => u.id === req.user.id);
  let total = 0;
  const orderItems = items.map((item) => {
    const price = item.pricePerKg || item.price || 0;
    const subtotal = item.quantity * price;
    total += subtotal;
    return { ...item, price, pricePerKg: price, subtotal };
  });

  db.orderCounter = (db.orderCounter || 2000) + 1;
  const newOrder = {
    id: `ORD-${db.orderCounter}`, vendorId: vendor.id, vendorName: vendor.name,
    vendorUpiId: vendor.upiId || '',
    businessId: req.user.id, businessName: business?.name || req.user.name,
    buyerName: business?.name || req.user.name,
    items: orderItems, total: Math.round(total), totalAmount: Math.round(total), status: 'pending',
    deliveryAddress: deliveryAddress || business?.location?.address || 'Hyderabad',
    createdAt: new Date().toISOString(), estimatedDelivery: '45 mins',
  };

  db.orders.push(newOrder);

  // Deduct stock quantities
  orderItems.forEach((orderItem) => {
    const stockItem = db.stock.find(
      (s) => s.vendorId === vendorId && s.name.toLowerCase() === orderItem.name.toLowerCase() && s.quantity > 0
    );
    if (stockItem) {
      stockItem.quantity = Math.max(0, stockItem.quantity - orderItem.quantity);
      stockItem.status = stockItem.quantity > 10 ? 'In Stock' : stockItem.quantity > 0 ? 'Low Stock' : 'Out of Stock';
    }
  });

  scheduleSave();
  res.status(201).json({ message: 'Order placed', order: newOrder });
});

// PUT /api/orders/:id/status
router.put('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'processing', 'packed', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (req.user.role === 'vendor' && order.vendorId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  if (req.user.role === 'business' && order.businessId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  order.status = status;
  if (status === 'delivered') order.deliveredAt = new Date().toISOString();

  // Update vendor's total orders on delivery
  if (status === 'delivered') {
    const vendor = db.users.find((u) => u.id === order.vendorId);
    if (vendor) vendor.totalOrders = (vendor.totalOrders || 0) + 1;
  }

  scheduleSave();
  res.json({ message: 'Status updated', order });
});

// GET /api/orders/stats
router.get('/stats', authenticateToken, (req, res) => {
  let userOrders;
  if (req.user.role === 'vendor') {
    userOrders = db.orders.filter((o) => o.vendorId === req.user.id);
  } else {
    userOrders = db.orders.filter((o) => o.businessId === req.user.id);
  }

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = userOrders.filter((o) => o.createdAt.startsWith(today));

  res.json({
    totalOrders: userOrders.length,
    pendingOrders: userOrders.filter((o) => o.status === 'pending').length,
    processingOrders: userOrders.filter((o) => ['processing', 'confirmed'].includes(o.status)).length,
    inTransitOrders: userOrders.filter((o) => o.status === 'in_transit').length,
    deliveredToday: todayOrders.filter((o) => o.status === 'delivered').length,
    totalRevenue: userOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    todaySales: todayOrders.reduce((s, o) => s + o.total, 0),
  });
});

// GET /api/orders/:id - Get single order with vendor payment info
router.get('/:id', authenticateToken, (req, res) => {
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Include vendor UPI info for payment
  const vendor = db.users.find((u) => u.id === order.vendorId);
  const vendorPayment = vendor ? {
    upiId: vendor.upiId || '',
    shopName: vendor.shopName || vendor.name,
    phone: vendor.phone || '',
  } : {};

  res.json({ order: { ...order, vendorPayment } });
});

module.exports = router;
