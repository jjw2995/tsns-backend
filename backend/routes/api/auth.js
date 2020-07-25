const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers/index');

// const expressValidator = require('express-validator');

router.get('/', authController.getRegister);

router.post(
  '/register',
  authController.validate('postRegister'),
  authController.postRegister
);
// call service layer

// ###############################
router.get('/', (req, res) => {
  res.status(400).json();
});
// ###############################

module.exports = router;
