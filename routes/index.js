const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers')

// Do work here
router.get('/', catchErrors(courtController.getCourt));
router.get('/courts', catchErrors(courtController.getCourt));
router.get('/add', authController.isLoggedIn,courtController.addCourt);

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

router.get('/tags', catchErrors(courtController.getCourtsByTag));
router.get('/tags/:tag', catchErrors(courtController.getCourtsByTag));

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post('/register', 
  userController.validateRegister,
  userController.register,
  authController.login);

router.get('/logout', authController.logout);

module.exports = router;
