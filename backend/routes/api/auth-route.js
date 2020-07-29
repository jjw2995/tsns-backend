const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers/index');
const { verifyAccessToken } = require('../../middlewares');
const {
	validateEmail,
	validateNick,
	validatePass,
	validate,
} = require('../../utils/validations');

// TESTING ONLY
router.get('/reset', authController.getRegister);

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
// router.get('/', verifyAccessToken, (req, res) => {
// 	console.log('authed user inside');
// 	res.status(400).json();
// });

router.get('/', (req, res) => {
	console.log('inside GET api/auth');
	res.status(200).send('in GET api/auth');
});

// ###############################

module.exports = router;
