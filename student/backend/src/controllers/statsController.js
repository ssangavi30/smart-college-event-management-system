const { query } = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [eventCount] = await query('SELECT COUNT(*) as count FROM events');
    const [userCount] = await query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [regCount] = await query('SELECT COUNT(*) as count FROM registrations WHERE status != "Cancelled"');
    const [certCount] = await query('SELECT COUNT(*) as count FROM certificates');
    const [attendedCount] = await query('SELECT COUNT(*) as count FROM registrations WHERE attendance = "Present"');

    const categoryBreakdown = await query(`
      SELECT category, COUNT(*) as count
      FROM events
      GROUP BY category
    `);

    const recentRegistrations = await query(`
      SELECT r.id, r.event_id, r.student_name, r.student_roll, r.registered_at, r.status, r.attendance, e.name as event_name
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    return res.json({
      success: true,
      stats: {
        totalEvents: eventCount ? eventCount.count : 0,
        totalStudents: userCount ? userCount.count : 0,
        totalRegistrations: regCount ? regCount.count : 0,
        totalCertificates: certCount ? certCount.count : 0,
        attendanceRate: (regCount && regCount.count > 0) ? Math.round(((attendedCount ? attendedCount.count : 0) / regCount.count) * 100) : 0,
        categoryBreakdown,
        recentRegistrations
      }
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getDashboardStats
};
