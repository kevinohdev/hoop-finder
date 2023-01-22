const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const { catchErrors } = require('../handlers/errorHandlers')

// Do work here
router.get('/', catchErrors(courtController.getCourt));
router.get('/courts', catchErrors(courtController.getCourt));
router.get('/add', courtController.addCourt);

router.post('/add', 
  courtController.upload,
  catchErrors(courtController.resize),
  catchErrors(courtController.createCourt));

router.post('/add/:id',
  courtController.upload,
  catchErrors(courtController.resize), 
  catchErrors(courtController.updateCourt));

router.get('/courts/:id/edit', catchErrors(courtController.editCourt));

router.get('/court/:slug/', catchErrors(courtController.getCourtBySlug));

module.exports = router;
