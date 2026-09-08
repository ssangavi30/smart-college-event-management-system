const { query } = require('../config/db');

function formatNotification(n) {
  return {
    id: n.id,
    userId: n.user_id,
    title: n.title,
    message: n.message,
    date: n.date instanceof Date ? n.date.toISOString().split('T')[0] : n.date,
    unread: Boolean(n.unread),
    type: n.type,
    createdAt: n.created_at
  };
}

// 1. Get Notifications
async function getNotifications(req, res) {
  try {
    const { userId } = req.query;

    let sql = 'SELECT * FROM notifications';
    const params = [];

    if (userId) {
      sql += ' WHERE user_id = "all" OR user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return res.json(rows.map(formatNotification));
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Mark Notification as Read
async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    await query('UPDATE notifications SET unread = false WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Notification marked as read.', id });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 3. Create/Broadcast Notification
async function createNotification(req, res) {
  try {
    const { userId = 'all', title, message, type = 'event' } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const notifId = `NOTIF-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    await query(
      'INSERT INTO notifications (id, user_id, title, message, date, unread, type) VALUES (?, ?, ?, ?, ?, true, ?)',
      [notifId, userId, title, message, today, type]
    );

    const [created] = await query('SELECT * FROM notifications WHERE id = ?', [notifId]);
    return res.status(201).json({
      success: true,
      message: 'Notification sent successfully.',
      notification: formatNotification(created)
    });
  } catch (err) {
    console.error('Create notification error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getNotifications,
  markNotificationRead,
  createNotification
};
