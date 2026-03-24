const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'freshlink-hackathon-secret-2026';

const DEMO_VENDOR = {
  id: 'vendor-1',
  name: 'Ravi Vegetables',
  role: 'vendor',
  email: 'ravi@freshlink.com',
  phone: '9876543210',
  shopName: 'Ravi Fresh Vegetables',
  shopAddress: 'Madhapur, Hyderabad',
  upiId: 'ravi.veggies@upi'
};

const DEMO_BUSINESS = {
  id: 'business-1',
  name: 'Spice Kitchen Restaurant',
  role: 'business',
  email: 'spicekitchen@freshlink.com',
  phone: '9876543211',
  businessType: 'Restaurant',
  deliveryAddress: 'Jubilee Hills, Hyderabad'
};

function authenticateToken(req, res, next) {
  // Try JWT token first
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      // Token invalid — fall through to X-Role
    }
  }

  // Fallback: use X-Role header for demo mode
  const role = req.headers['x-role'] ||
    (req.originalUrl.includes('/business') ? 'business' : 'vendor');
  req.user = role === 'business' ? DEMO_BUSINESS : DEMO_VENDOR;
  next();
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authenticateToken, generateToken, DEMO_VENDOR, DEMO_BUSINESS };
