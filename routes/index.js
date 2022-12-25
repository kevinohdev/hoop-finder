const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');

// Do work here
router.get('/', courtController.homePage);
router.get('/add', courtController.addCourt);
router.post('/add', courtController.createCourt);

module.exports = router;
