const { query } = require('../config/db');

function formatAttendanceRecord(r) {
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
    qrPassCode: r.qr_pass_code
  };
}

// 1. Get Attendance Records
async function getAttendance(req, res) {
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
    return res.json(rows.map(formatAttendanceRecord));
  } catch (err) {
    console.error('Get attendance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Mark Attendance (QR Scanner / Manual Student ID or Roll)
async function markAttendance(req, res) {
  try {
    const { eventId, studentIdOrPass, status = 'Present' } = req.body;

    if (!studentIdOrPass) {
      return res.status(400).json({ success: false, message: 'Student ID, Roll Number, or QR Pass Code is required.' });
    }

    let sql = `
      SELECT r.*, e.name as event_name, e.date as event_date, e.venue as event_venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE (r.student_id = ? OR r.qr_pass_code = ? OR r.student_roll = ?)
    `;
    const params = [studentIdOrPass, studentIdOrPass, studentIdOrPass];

    if (eventId) {
      sql += ' AND r.event_id = ?';
      params.push(eventId);
    }

    sql += ' LIMIT 1';

    const rows = await query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching registration found for this QR Pass or Student ID.'
      });
    }

    const reg = rows[0];
    await query('UPDATE registrations SET attendance = ? WHERE id = ?', [status, reg.id]);

    reg.attendance = status;
    return res.json({
      success: true,
      message: `Attendance marked as ${status}.`,
      record: formatAttendanceRecord(reg)
    });
  } catch (err) {
    console.error('Mark attendance error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getAttendance,
  markAttendance
};
