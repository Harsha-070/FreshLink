const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

// Initialize payments in db if not exists
if (!db.payments) {
  db.payments = [];
}

// UPI Apps supported
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: 'gpay', deepLink: 'gpay://upi/' },
  { id: 'phonepe', name: 'PhonePe', icon: 'phonepe', deepLink: 'phonepe://upi/' },
  { id: 'paytm', name: 'Paytm', icon: 'paytm', deepLink: 'paytm://upi/' },
  { id: 'bhim', name: 'BHIM', icon: 'bhim', deepLink: 'bhim://upi/' },
  { id: 'amazonpay', name: 'Amazon Pay', icon: 'amazonpay', deepLink: 'amazonpay://upi/' },
];

// POST /api/payments/create-order - Create payment order
router.post('/create-order', authenticateToken, (req, res) => {
  const { orderId, amount, method } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Order ID and amount required' });
  }

  // Find the order
  const order = db.orders.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Get vendor's UPI ID
  const vendor = db.users.find(u => u.id === order.vendorId);
  const vendorUpiId = vendor?.upiId || 'freshlink@upi';

  const paymentOrder = {
    id: `PAY-${Date.now()}`,
    orderId,
    amount,
    currency: 'INR',
    method: method || 'upi',
    status: 'pending',
    vendorUpiId,
    businessId: req.user.id,
    createdAt: new Date().toISOString(),
  };

  // Generate UPI payment link
  const upiLink = generateUPILink({
    pa: vendorUpiId,
    pn: vendor?.shopName || vendor?.name || 'FreshLink Vendor',
    am: amount,
    cu: 'INR',
    tn: `FreshLink Order ${orderId}`,
  });

  paymentOrder.upiLink = upiLink;
  paymentOrder.qrData = upiLink; // Same data for QR code

  db.payments.push(paymentOrder);
  scheduleSave();

  res.json({
    paymentOrder,
    upiApps: UPI_APPS,
    upiLink,
  });
});

// Generate UPI deep link
function generateUPILink({ pa, pn, am, cu, tn }) {
  const params = new URLSearchParams({
    pa, // Payee VPA
    pn, // Payee Name
    am: am.toString(), // Amount
    cu, // Currency
    tn, // Transaction Note
  });
  return `upi://pay?${params.toString()}`;
}

// POST /api/payments/verify - Verify UPI payment
router.post('/verify', authenticateToken, (req, res) => {
  const { paymentId, upiTransactionId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID required' });
  }

  const payment = db.payments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  // In production, verify with UPI provider
  // For demo, we'll mark as successful
  payment.status = 'completed';
  payment.upiTransactionId = upiTransactionId || `UPI${Date.now()}`;
  payment.completedAt = new Date().toISOString();

  // Update order payment status
  const order = db.orders.find(o => o.id === payment.orderId);
  if (order) {
    order.paymentStatus = 'paid';
    order.paymentId = payment.id;
  }

  scheduleSave();

  res.json({
    success: true,
    payment,
    message: 'Payment verified successfully',
  });
});

// POST /api/payments/razorpay/create - Create Razorpay order
router.post('/razorpay/create', authenticateToken, (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ error: 'Order ID and amount required' });
  }

  // Simulated Razorpay order creation
  // In production, use Razorpay SDK: razorpay.orders.create()
  const razorpayOrder = {
    id: `order_${Date.now()}`,
    entity: 'order',
    amount: amount * 100, // Razorpay uses paise
    amount_paid: 0,
    amount_due: amount * 100,
    currency: 'INR',
    receipt: orderId,
    status: 'created',
    created_at: Math.floor(Date.now() / 1000),
  };

  const paymentOrder = {
    id: `PAY-${Date.now()}`,
    orderId,
    razorpayOrderId: razorpayOrder.id,
    amount,
    currency: 'INR',
    method: 'razorpay',
    status: 'pending',
    businessId: req.user.id,
    createdAt: new Date().toISOString(),
  };

  db.payments.push(paymentOrder);
  scheduleSave();

  res.json({
    razorpayOrder,
    paymentOrder,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo_key',
  });
});

// POST /api/payments/razorpay/verify - Verify Razorpay payment
router.post('/razorpay/verify', authenticateToken, (req, res) => {
  const { paymentId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID required' });
  }

  const payment = db.payments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  // In production, verify signature using:
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  //   .update(razorpay_order_id + '|' + razorpay_payment_id)
  //   .digest('hex');

  payment.status = 'completed';
  payment.razorpayPaymentId = razorpay_payment_id || `pay_${Date.now()}`;
  payment.razorpaySignature = razorpay_signature;
  payment.completedAt = new Date().toISOString();

  // Update order payment status
  const order = db.orders.find(o => o.id === payment.orderId);
  if (order) {
    order.paymentStatus = 'paid';
    order.paymentId = payment.id;
  }

  scheduleSave();

  res.json({
    success: true,
    payment,
    message: 'Payment verified successfully',
  });
});

// GET /api/payments/:orderId - Get payment status for order
router.get('/:orderId', authenticateToken, (req, res) => {
  const payment = db.payments.find(p => p.orderId === req.params.orderId);

  if (!payment) {
    return res.json({ payment: null, status: 'not_initiated' });
  }

  res.json({ payment });
});

// GET /api/payments/history - Get payment history
router.get('/', authenticateToken, (req, res) => {
  const payments = db.payments.filter(p => p.businessId === req.user.id);
  payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ payments });
});

// POST /api/payments/refund - Request refund
router.post('/refund', authenticateToken, (req, res) => {
  const { paymentId, reason } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: 'Payment ID required' });
  }

  const payment = db.payments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  if (payment.status !== 'completed') {
    return res.status(400).json({ error: 'Can only refund completed payments' });
  }

  payment.refundStatus = 'requested';
  payment.refundReason = reason || 'Customer requested';
  payment.refundRequestedAt = new Date().toISOString();

  scheduleSave();

  res.json({
    message: 'Refund request submitted',
    payment,
  });
});

module.exports = router;
