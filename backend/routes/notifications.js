const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db, scheduleSave } = require('../data/db');

const router = express.Router();

// Initialize notifications in db if not exists
if (!db.notifications) {
  db.notifications = [];
}

// Notification types
const NOTIFICATION_TYPES = {
  ORDER_PLACED: 'order_placed',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  NEW_REQUIREMENT: 'new_requirement',
  STOCK_LOW: 'stock_low',
  SURPLUS_ALERT: 'surplus_alert',
  MATCH_FOUND: 'match_found',
  PAYMENT_RECEIVED: 'payment_received',
  PRICE_DROP: 'price_drop',
};

// GET /api/notifications - Get user's notifications
router.get('/', authenticateToken, (req, res) => {
  const { unreadOnly, limit } = req.query;

  let notifications = db.notifications.filter(n => n.userId === req.user.id);

  if (unreadOnly === 'true') {
    notifications = notifications.filter(n => !n.read);
  }

  // Sort by createdAt descending
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (limit) {
    notifications = notifications.slice(0, parseInt(limit));
  }

  const unreadCount = db.notifications.filter(n => n.userId === req.user.id && !n.read).length;

  res.json({ notifications, unreadCount });
});

// POST /api/notifications - Create notification (internal use)
router.post('/', authenticateToken, (req, res) => {
  const { userId, type, title, message, data } = req.body;

  if (!userId || !type || !title) {
    return res.status(400).json({ error: 'userId, type, and title required' });
  }

  const notification = {
    id: `notif-${Date.now()}`,
    userId,
    type,
    title,
    message: message || '',
    data: data || {},
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.push(notification);
  scheduleSave();

  res.status(201).json({ notification });
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  const notification = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  notification.read = true;
  scheduleSave();

  res.json({ notification });
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', authenticateToken, (req, res) => {
  const userNotifications = db.notifications.filter(n => n.userId === req.user.id);
  userNotifications.forEach(n => n.read = true);
  scheduleSave();

  res.json({ message: 'All notifications marked as read', count: userNotifications.length });
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, (req, res) => {
  const index = db.notifications.findIndex(n => n.id === req.params.id && n.userId === req.user.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  db.notifications.splice(index, 1);
  scheduleSave();

  res.json({ message: 'Notification deleted' });
});

// Helper function to create notifications (exported for use in other routes)
function createNotification(userId, type, title, message, data = {}) {
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    title,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.push(notification);
  scheduleSave();

  return notification;
}

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', authenticateToken, (req, res) => {
  // Default preferences
  res.json({
    preferences: {
      orderUpdates: true,
      newMatches: true,
      priceAlerts: true,
      stockAlerts: true,
      promotions: false,
      email: true,
      push: true,
      sms: false,
    }
  });
});

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
