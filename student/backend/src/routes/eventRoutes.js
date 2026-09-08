const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { optionalAuth, authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.post('/', optionalAuth, eventController.createEvent);
router.put('/:id', optionalAuth, eventController.updateEvent);
router.delete('/:id', optionalAuth, eventController.deleteEvent);

module.exports = router;
