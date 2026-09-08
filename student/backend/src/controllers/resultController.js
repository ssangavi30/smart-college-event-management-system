const { query } = require('../config/db');

function formatResult(r) {
  return {
    id: r.id,
    eventId: r.event_id,
    eventName: r.event_name,
    publishedDate: r.published_date instanceof Date ? r.published_date.toISOString().split('T')[0] : r.published_date,
    winnerFirst: r.winner_first,
    winnerSecond: r.winner_second,
    winnerThird: r.winner_third,
    specialMention: r.special_mention,
    createdAt: r.created_at
  };
}

// 1. Get Event Results (Optional eventId filter)
async function getResults(req, res) {
  try {
    const { eventId } = req.query;

    let sql = 'SELECT * FROM event_results';
    const params = [];

    if (eventId) {
      sql += ' WHERE event_id = ?';
      params.push(eventId);
    }

    sql += ' ORDER BY published_date DESC, created_at DESC';

    const rows = await query(sql, params);
    return res.json(rows.map(formatResult));
  } catch (err) {
    console.error('Get results error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

// 2. Publish/Create Event Result
async function createResult(req, res) {
  try {
    const {
      eventId,
      eventName,
      publishedDate,
      winnerFirst,
      winnerSecond,
      winnerThird,
      specialMention
    } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    let finalEventName = eventName;
    if (!finalEventName) {
      const [evt] = await query('SELECT name FROM events WHERE id = ?', [eventId]);
      finalEventName = evt ? evt.name : 'College Event';
    }

    const pubDate = publishedDate || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO event_results (event_id, event_name, published_date, winner_first, winner_second, winner_third, special_mention)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        finalEventName,
        pubDate,
        winnerFirst || 'TBD',
        winnerSecond || 'TBD',
        winnerThird || 'TBD',
        specialMention || null
      ]
    );

    const [created] = await query('SELECT * FROM event_results WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Competition results published successfully.',
      result: formatResult(created)
    });
  } catch (err) {
    console.error('Create result error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getResults,
  createResult
};
