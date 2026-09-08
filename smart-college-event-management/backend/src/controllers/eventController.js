const { query } = require('../config/db');

function formatEvent(e) {
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    department: e.department,
    description: e.description,
    banner: e.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : e.date,
    startTime: e.start_time,
    endTime: e.end_time,
    venue: e.venue,
    organizerId: e.organizer_id,
    organizerName: e.organizer_name,
    maxParticipants: e.max_participants,
    registeredCount: e.registered_count,
    registrationDeadline: e.registration_deadline instanceof Date ? e.registration_deadline.toISOString().split('T')[0] : e.registration_deadline,
    status: e.status,
    rules: e.rules,
    eligibility: e.eligibility,
    fee: e.fee || 'Free',
    createdAt: e.created_at
  };
}

// 1. Get All Events (with filters & search)
async function getEvents(req, res) {
  try {
    const { category, department, search, organizerId } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    if (department && department !== 'All') {
      sql += ' AND LOWER(department) LIKE LOWER(?)';
      params.push(`%${department}%`);
    }
    if (organizerId) {
      sql += ' AND organizer_id = ?';
      params.push(organizerId);
    }
    if (search) {
      sql += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(venue) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY date ASC, created_at DESC';

    const rows = await query(sql, params);
    const events = rows.map(formatEvent);
    return res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Get Event By ID
async function getEventById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    return res.json(formatEvent(rows[0]));
  } catch (err) {
    console.error('Get event by id error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 3. Create Event
async function createEvent(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.category || !data.date || !data.venue) {
      return res.status(400).json({
        success: false,
        message: 'Event name, category, date, and venue are required.'
      });
    }

    // Auto-generate Event ID if not given
    const [countRow] = await query('SELECT COUNT(*) as count FROM events');
    const newId = data.id || `EVT-2026-${String(countRow[0].count + 1).padStart(2, '0')}`;

    const banner = data.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
    const status = data.status || 'Upcoming';
    const fee = data.fee || 'Free';

    await query(
      `INSERT INTO events (
        id, name, category, department, description, banner, date,
        start_time, end_time, venue, organizer_id, organizer_name,
        max_participants, registered_count, registration_deadline,
        status, rules, eligibility, fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        data.name,
        data.category,
        data.department || 'General',
        data.description || '',
        banner,
        data.date,
        data.startTime || '09:00 AM',
        data.endTime || '05:00 PM',
        data.venue,
        data.organizerId || (req.user ? req.user.id : 'USR-ORG-001'),
        data.organizerName || (req.user ? req.user.name : 'College Organizer'),
        parseInt(data.maxParticipants || 100, 10),
        0,
        data.registrationDeadline || data.date,
        status,
        data.rules || '',
        data.eligibility || 'Open to all students',
        fee
      ]
    );

    const [created] = await query('SELECT * FROM events WHERE id = ?', [newId]);
    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      event: formatEvent(created)
    });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 4. Update Event
async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const [existing] = await query('SELECT * FROM events WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const fields = [];
    const params = [];

    const fieldMap = {
      name: 'name',
      category: 'category',
      department: 'department',
      description: 'description',
      banner: 'banner',
      date: 'date',
      startTime: 'start_time',
      endTime: 'end_time',
      venue: 'venue',
      organizerId: 'organizer_id',
      organizerName: 'organizer_name',
      maxParticipants: 'max_participants',
      registeredCount: 'registered_count',
      registrationDeadline: 'registration_deadline',
      status: 'status',
      rules: 'rules',
      eligibility: 'eligibility',
      fee: 'fee'
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length > 0) {
      params.push(id);
      await query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await query('SELECT * FROM events WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Event updated successfully.',
      event: formatEvent(updated)
    });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 5. Delete Event
async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const rows = await query('SELECT id FROM events WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    await query('DELETE FROM events WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Event deleted successfully.', id });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
