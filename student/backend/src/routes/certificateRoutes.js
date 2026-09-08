const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.get('/', certificateController.getCertificates);
router.post('/', certificateController.issueCertificate);
router.get('/verify/:code', certificateController.verifyCertificate);

module.exports = router;
