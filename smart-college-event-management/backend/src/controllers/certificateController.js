const { query } = require('../config/db');

function formatCertificate(c) {
  return {
    id: c.id,
    eventId: c.event_id,
    eventName: c.event_name,
    studentId: c.student_id,
    studentName: c.student_name,
    studentRoll: c.student_roll,
    department: c.department,
    type: c.type,
    issueDate: c.issue_date instanceof Date ? c.issue_date.toISOString().split('T')[0] : c.issue_date,
    status: c.status,
    issuedBy: c.issued_by,
    verificationCode: c.verification_code,
    createdAt: c.created_at
  };
}

// 1. Get Certificates (Optional studentId filter)
async function getCertificates(req, res) {
  try {
    const { studentId } = req.query;

    let sql = 'SELECT * FROM certificates';
    const params = [];

    if (studentId) {
      sql += ' WHERE student_id = ?';
      params.push(studentId);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return res.json(rows.map(formatCertificate));
  } catch (err) {
    console.error('Get certificates error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Issue Certificate
async function issueCertificate(req, res) {
  try {
    const certData = req.body;
    if (!certData.eventId || !certData.studentId) {
      return res.status(400).json({ success: false, message: 'Event ID and Student ID are required.' });
    }

    const certId = certData.id || `CERT-${Date.now().toString().slice(-6)}`;
    const issueDate = certData.issueDate || new Date().toISOString().split('T')[0];
    const status = certData.status || 'Issued';
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const verificationCode = certData.verificationCode || `SC-${randomHex}`;

    // Get event and student details if missing
    let eventName = certData.eventName;
    if (!eventName) {
      const [evt] = await query('SELECT name FROM events WHERE id = ?', [certData.eventId]);
      if (evt) eventName = evt.name;
    }

    let studentName = certData.studentName;
    let studentRoll = certData.studentRoll;
    let department = certData.department;
    if (!studentName) {
      const [stu] = await query('SELECT name, student_id, department FROM users WHERE id = ?', [certData.studentId]);
      if (stu) {
        studentName = stu.name;
        studentRoll = stu.student_id;
        department = stu.department;
      }
    }

    await query(
      `INSERT INTO certificates (
        id, event_id, event_name, student_id, student_name,
        student_roll, department, type, issue_date, status,
        issued_by, verification_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        certId,
        certData.eventId,
        eventName || 'College Event',
        certData.studentId,
        studentName || 'Student Participant',
        studentRoll || 'STU-GEN',
        department || 'General',
        certData.type || 'Certificate of Excellence',
        issueDate,
        status,
        certData.issuedBy || 'Event Coordinator & Dean of Student Activities',
        verificationCode
      ]
    );

    // Update Registration Flag
    await query(
      `UPDATE registrations
       SET certificate_available = true, certificate_id = ?
       WHERE event_id = ? AND student_id = ?`,
      [certId, certData.eventId, certData.studentId]
    );

    const [created] = await query('SELECT * FROM certificates WHERE id = ?', [certId]);
    return res.status(201).json({
      success: true,
      message: 'Certificate issued successfully.',
      certificate: formatCertificate(created)
    });
  } catch (err) {
    console.error('Issue certificate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 3. Verify Certificate by Verification Code
async function verifyCertificate(req, res) {
  try {
    const { code } = req.params;
    const rows = await query('SELECT * FROM certificates WHERE verification_code = ? LIMIT 1', [code]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'No certificate found with this verification code.'
      });
    }

    return res.json({
      success: true,
      valid: true,
      message: 'Certificate is authentic and valid.',
      certificate: formatCertificate(rows[0])
    });
  } catch (err) {
    console.error('Verify certificate error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getCertificates,
  issueCertificate,
  verifyCertificate
};
