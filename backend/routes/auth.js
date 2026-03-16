const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');
const { sendOtp: deliverOtp } = require('../services/otpService');

const router = express.Router();

// In-memory OTP store: { identifier: { otp, expiresAt } }
const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { identifier, type } = req.body;
    if (!identifier || !type) {
      return res.status(400).json({ error: 'identifier and type are required' });
    }
    const otp = generateOtp();
    otpStore.set(identifier, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    // Send OTP via email/SMS
    const result = await deliverOtp(identifier, type, otp);

    // If delivery failed (no Gmail/SMS configured), return OTP in response for demo
    const response = { message: 'OTP sent' };
    if (!result.sent) {
      response.otp = otp; // Fallback: show in UI for demo
      response.note = 'OTP shown in response (configure GMAIL_USER & GMAIL_APP_PASSWORD in .env to send real emails)';
    }

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  try {
    const { identifier, otp, role, name } = req.body;
    if (!identifier || !otp || !role) {
      return res.status(400).json({ error: 'identifier, otp, and role are required' });
    }

    const stored = otpStore.get(identifier);
    if (!stored) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    otpStore.delete(identifier);

    // Find or create user
    let user = db.users.find(
      (u) => (u.phone === identifier || u.email === identifier) && u.role === role
    );

    if (!user) {
      const isEmail = identifier.includes('@');
      user = {
        id: `${role}-${Date.now()}`,
        name: name || (isEmail ? identifier.split('@')[0] : `New ${role === 'vendor' ? 'Vendor' : 'Business'}`),
        email: isEmail ? identifier : '',
        phone: isEmail ? '' : identifier,
        password: '',
        role,
        location: { lat: 17.3850, lng: 78.4867, address: 'Hyderabad' },
        rating: role === 'vendor' ? 4.0 : undefined,
        totalOrders: 0,
        joinedDate: new Date().toISOString().split('T')[0],
        businessType: role === 'business' ? 'Restaurant' : undefined,
      };
      db.users.push(user);
      scheduleSave();
    }

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    res.json({ message: 'OTP verified', token, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// POST /api/auth/demo-login
router.post('/demo-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = db.users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    res.json({ message: 'Login successful', token, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/forgot-password - Send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: 'Email or phone is required' });

    const user = db.users.find((u) => u.email === identifier || u.phone === identifier);
    if (!user) return res.status(404).json({ error: 'No account found with this email/phone' });

    const otp = generateOtp();
    otpStore.set(`reset-${identifier}`, { otp, expiresAt: Date.now() + 5 * 60 * 1000, userId: user.id });

    const type = identifier.includes('@') ? 'email' : 'phone';
    const result = await deliverOtp(identifier, type, otp);

    const response = { message: 'Reset OTP sent' };
    if (!result.sent) {
      response.otp = otp;
    }
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset OTP' });
  }
});

// POST /api/auth/reset-password - Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'identifier, otp, and newPassword are required' });
    }

    const stored = otpStore.get(`reset-${identifier}`);
    if (!stored) return res.status(400).json({ error: 'No reset OTP found' });
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`reset-${identifier}`);
      return res.status(400).json({ error: 'OTP expired' });
    }
    if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    otpStore.delete(`reset-${identifier}`);

    const user = db.users.find((u) => u.id === stored.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    scheduleSave();

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    res.json({ message: 'Password reset successful', token, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

// Legacy endpoints
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = db.users.find((u) => u.email === email && (!role || u.role === role));
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

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, location, businessType } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    if (db.users.find((u) => u.email === email)) return res.status(409).json({ error: 'Email already exists' });
    const newUser = {
      id: `${role}-${Date.now()}`, name, email, phone: phone || '', password: await bcrypt.hash(password, 10),
      role, location: location || { lat: 17.385, lng: 78.4867, address: 'Hyderabad' },
      businessType: businessType || null, rating: role === 'vendor' ? 4.0 : undefined,
      totalOrders: 0, joinedDate: new Date().toISOString().split('T')[0],
    };
    db.users.push(newUser);
    scheduleSave();
    const token = generateToken(newUser);
    const { password: _, ...safe } = newUser;
    res.status(201).json({ message: 'Registration successful', token, user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, phone, email, upiId, shopName, shopAddress, shopDescription, businessType, deliveryAddress } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (email) user.email = email;
  if (upiId !== undefined) user.upiId = upiId;
  if (shopName) user.shopName = shopName;
  if (shopAddress) user.shopAddress = shopAddress;
  if (shopDescription) user.shopDescription = shopDescription;
  if (businessType) user.businessType = businessType;
  if (deliveryAddress) user.deliveryAddress = deliveryAddress;

  scheduleSave();
  const { password: _, ...safe } = user;
  res.json({ message: 'Profile updated', user: safe });
});

module.exports = router;
