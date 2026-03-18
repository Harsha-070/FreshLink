const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

// POST /api/auth/login - Login with phone and password
router.post('/login', async (req, res) => {
  try {
    const { phone, password, role } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const user = db.users.find((u) => u.phone === phone && (!role || u.role === role));
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    res.json({ message: 'Login successful', token, user: safe });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - Register with phone, password and details
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      role,
      email,
      // Vendor specific fields
      shopName,
      shopAddress,
      shopDescription,
      upiId,
      // Business specific fields
      businessType,
      deliveryAddress
    } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: 'Name, phone, password, and role are required' });
    }

    // Validate phone format
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone.match(/^\+?\d{10,13}$/)) {
      return res.status(400).json({ error: 'Please enter a valid phone number' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if phone already exists for this role
    if (db.users.find((u) => u.phone === cleanPhone && u.role === role)) {
      return res.status(409).json({ error: 'An account with this phone number already exists' });
    }

    // Create new user
    const newUser = {
      id: `${role}-${Date.now()}`,
      name,
      phone: cleanPhone,
      email: email || '',
      password: await bcrypt.hash(password, 10),
      role,
      location: { lat: 17.385, lng: 78.4867, address: shopAddress || deliveryAddress || 'Hyderabad' },
      joinedDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
    };

    // Add role-specific fields
    if (role === 'vendor') {
      newUser.rating = 4.0;
      newUser.shopName = shopName || '';
      newUser.shopAddress = shopAddress || '';
      newUser.shopDescription = shopDescription || '';
      newUser.upiId = upiId || '';
    } else if (role === 'business') {
      newUser.businessType = businessType || 'Restaurant';
      newUser.deliveryAddress = deliveryAddress || '';
    }

    db.users.push(newUser);
    scheduleSave();

    const token = generateToken(newUser);
    const { password: _, ...safe } = newUser;
    res.status(201).json({ message: 'Registration successful', token, user: safe });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/check-phone - Check if phone exists
router.post('/check-phone', (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/\s/g, '');
    const exists = db.users.some((u) => u.phone === cleanPhone && (!role || u.role === role));
    res.json({ exists });
  } catch (err) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    name,
    phone,
    email,
    upiId,
    shopName,
    shopAddress,
    shopDescription,
    businessType,
    deliveryAddress
  } = req.body;

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

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    scheduleSave();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
