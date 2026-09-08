const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', registrationController.getRegistrations);
router.post('/', optionalAuth, registrationController.registerForEvent);
router.delete('/:id', optionalAuth, registrationController.cancelRegistration);

module.exports = router;
