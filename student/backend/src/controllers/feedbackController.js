const { query } = require('../config/db');

function formatFeedback(f) {
  return {
    id: f.id,
    eventId: f.event_id,
    eventName: f.event_name,
    studentId: f.student_id,
    studentName: f.student_name,
    rating: f.rating,
    comments: f.comments,
    submittedAt: f.submitted_at instanceof Date ? f.submitted_at.toISOString().split('T')[0] : f.submitted_at,
    createdAt: f.created_at
  };
}

// 1. Get Feedback
async function getFeedback(req, res) {
  try {
    const { eventId, studentId } = req.query;

    let sql = 'SELECT * FROM feedback WHERE 1=1';
    const params = [];

    if (eventId) {
      sql += ' AND event_id = ?';
      params.push(eventId);
    }
    if (studentId) {
      sql += ' AND student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return res.json(rows.map(formatFeedback));
  } catch (err) {
    console.error('Get feedback error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Submit Feedback
async function submitFeedback(req, res) {
  try {
    const { eventId, rating, comments, studentId: bodyStuId, studentName: bodyStuName } = req.body;

    if (!eventId || !rating) {
      return res.status(400).json({ success: false, message: 'Event ID and rating are required.' });
    }

    const studentId = bodyStuId || (req.user ? req.user.id : 'USR-STU-001');

    let studentName = bodyStuName;
    if (!studentName) {
      const [stu] = await query('SELECT name FROM users WHERE id = ?', [studentId]);
      studentName = stu ? stu.name : 'Student';
    }

    const [evt] = await query('SELECT name FROM events WHERE id = ?', [eventId]);
    const eventName = evt ? evt.name : 'Campus Event';

    const fbId = `FDB-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO feedback (id, event_id, event_name, student_id, student_name, rating, comments, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fbId, eventId, eventName, studentId, studentName, parseInt(rating, 10), comments || '', today]
    );

    const [created] = await query('SELECT * FROM feedback WHERE id = ?', [fbId]);
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your review!',
      feedback: formatFeedback(created)
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getFeedback,
  submitFeedback
};
