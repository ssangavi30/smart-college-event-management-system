const { query } = require('../config/db');

function formatRegistration(r) {
  return {
    id: r.id,
    eventId: r.event_id,
    eventName: r.event_name || r.name,
    eventDate: r.event_date instanceof Date ? r.event_date.toISOString().split('T')[0] : (r.event_date || r.date),
    eventVenue: r.event_venue || r.venue,
    studentId: r.student_id,
    studentName: r.student_name,
    studentRoll: r.student_roll,
    department: r.department,
    registeredAt: r.registered_at,
    status: r.status,
    attendance: r.attendance,
    certificateAvailable: Boolean(r.certificate_available),
    certificateId: r.certificate_id,
    qrPassCode: r.qr_pass_code,
    createdAt: r.created_at
  };
}

// 1. Register for Event
async function registerForEvent(req, res) {
  try {
    const { eventId, studentId: bodyStudentId } = req.body;
    const studentId = bodyStudentId || (req.user ? req.user.id : null);

    if (!eventId || !studentId) {
      return res.status(400).json({ success: false, message: 'Event ID and Student ID are required.' });
    }

    // Verify Event
    const eventRows = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event does not exist.' });
    }
    const event = eventRows[0];

    // Check Capacity
    if (event.registered_count >= event.max_participants) {
      return res.status(400).json({ success: false, message: 'Sorry, all seats for this event are fully booked.' });
    }

    // Verify Student
    const userRows = await query('SELECT * FROM users WHERE id = ?', [studentId]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student account not found.' });
    }
    const student = userRows[0];

    // Check Duplicate Registration
    const existing = await query(
      'SELECT id FROM registrations WHERE event_id = ? AND student_id = ? AND status != "Cancelled"',
      [eventId, studentId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You are already registered for this event.' });
    }

    // Generate Registration ID & QR Pass Code
    const [countRow] = await query('SELECT COUNT(*) as count FROM registrations');
    const newRegId = `REG-2026-${String((countRow ? countRow.count : 0) + 1).padStart(3, '0')}`;
    const cleanEventId = event.id.replace('EVT-', '');
    const cleanStudentId = student.id.slice(-4);
    const qrPassCode = `PASS-${cleanEventId}-${cleanStudentId}-${Date.now().toString().slice(-4)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    await query(
      `INSERT INTO registrations (
        id, event_id, student_id, student_name, student_roll, department,
        registered_at, status, attendance, certificate_available, qr_pass_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', 'Pending', false, ?)`,
      [
        newRegId,
        event.id,
        student.id,
        student.name,
        student.student_id || 'STU2024-REG',
        student.department || 'General',
        nowStr,
        qrPassCode
      ]
    );

    // Increment event seat count
    await query('UPDATE events SET registered_count = registered_count + 1 WHERE id = ?', [eventId]);

    // Construct response
    const newReg = {
      id: newRegId,
      eventId: event.id,
      eventName: event.name,
      eventDate: event.date instanceof Date ? event.date.toISOString().split('T')[0] : event.date,
      eventVenue: event.venue,
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.student_id || 'STU2024-REG',
      department: student.department || 'General',
      registeredAt: nowStr,
      status: 'Confirmed',
      attendance: 'Pending',
      certificateAvailable: false,
      certificateId: null,
      qrPassCode: qrPassCode
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      registration: newReg
    });
  } catch (err) {
    console.error('Register for event error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Get Registrations (Filter by studentId or eventId)
async function getRegistrations(req, res) {
  try {
    const { studentId, eventId } = req.query;

    let sql = `
      SELECT r.*, e.name as event_name, e.date as event_date, e.venue as event_venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (studentId) {
      sql += ' AND r.student_id = ?';
      params.push(studentId);
    }
    if (eventId) {
      sql += ' AND r.event_id = ?';
      params.push(eventId);
    }

    sql += ' ORDER BY r.created_at DESC';

    const rows = await query(sql, params);
    const regs = rows.map(formatRegistration);
    return res.json(regs);
  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 3. Cancel Registration
async function cancelRegistration(req, res) {
  try {
    const { id } = req.params;

    const rows = await query('SELECT * FROM registrations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    const reg = rows[0];
    if (reg.status !== 'Cancelled') {
      await query('UPDATE registrations SET status = "Cancelled" WHERE id = ?', [id]);
      await query('UPDATE events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = ?', [reg.event_id]);
    }

    return res.json({ success: true, message: 'Registration cancelled successfully.', id });
  } catch (err) {
    console.error('Cancel registration error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  registerForEvent,
  getRegistrations,
  cancelRegistration
};
