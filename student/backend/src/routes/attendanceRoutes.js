const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAttendance);
router.post('/mark', attendanceController.markAttendance);

module.exports = router;
