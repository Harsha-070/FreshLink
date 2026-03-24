const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken(user);
  res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
});

// POST /api/auth/demo-login (same as login)
router.post('/demo-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

  const token = generateToken(user);
  res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, phone, shopName, upiId, shopAddress, businessType, deliveryAddress } = req.body;

  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
  if (!['vendor', 'business'].includes(role)) return res.status(400).json({ error: 'Role must be vendor or business' });

  const exists = db.users.find(u => u.email === email);
  if (exists) return res.status(409).json({ error: 'Account already exists with this email. Please login.' });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `${role}-${Date.now()}`,
    name,
    email,
    password: hashedPassword,
    role,
    phone: phone || '',
    shopName: shopName || '',
    shopAddress: shopAddress || '',
    upiId: upiId || '',
    businessType: businessType || '',
    deliveryAddress: deliveryAddress || '',
    rating: 0,
    totalOrders: 0,
    joinedDate: new Date().toISOString(),
    location: { lat: 17.385, lng: 78.4867, address: shopAddress || deliveryAddress || 'Hyderabad' },
  };

  db.users.push(newUser);
  scheduleSave();

  const token = generateToken(newUser);
  res.status(201).json({ message: 'Registration successful', token, user: sanitizeUser(newUser) });
});

// POST /api/auth/check-phone
router.post('/check-phone', (req, res) => {
  const { phone } = req.body;
  const exists = db.users.some(u => u.phone === phone);
  res.json({ exists });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.json({ user: req.user });
  res.json({ user: sanitizeUser(user) });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const allowedFields = ['name', 'phone', 'shopName', 'shopAddress', 'shopDescription', 'upiId', 'businessType', 'deliveryAddress'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  scheduleSave();
  res.json({ message: 'Profile updated', user: sanitizeUser(user) });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  scheduleSave();
  res.json({ message: 'Password changed successfully' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'No account found with this email' });
  res.json({ message: 'Password reset instructions sent', success: true });
});

module.exports = router;
