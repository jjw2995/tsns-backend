const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers/index');
const {
	validateEmail,
	validateNick,
	validatePass,
	validate,
} = require('../../utils/validations');

router.get('/', authController.getRegister);

//  input
// {
//   nickname:String,
//   email:String,
//   password:String
// }

router.post(
	'/register',
	[validateEmail, validateNick, validatePass],
	validate,
	authController.postRegister
);

// call service layer

// ###############################
router.get('/', (req, res) => {
	res.status(400).json();
});
// ###############################

module.exports = router;
