const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');

// Do work here
router.get('/', courtController.homePage);

module.exports = router;
