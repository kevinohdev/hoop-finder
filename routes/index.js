const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const { catchErrors } = require('../handlers/errorHandlers')

// Do work here
router.get('/', courtController.homePage);
router.get('/add', courtController.addCourt);
router.post('/add', catchErrors(courtController.createCourt));

module.exports = router;
