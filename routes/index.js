const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const { catchErrors } = require('../handlers/errorHandlers')

// Do work here
router.get('/', catchErrors(courtController.getCourt));
router.get('/courts', catchErrors(courtController.getCourt));
router.get('/add', courtController.addCourt);
router.post('/add', catchErrors(courtController.createCourt));

module.exports = router;
