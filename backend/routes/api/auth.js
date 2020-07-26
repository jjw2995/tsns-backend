const express = require('express');
const router = express.Router();
const { authController } = require('../../controllers/index');
const {
	validateEmail,
	validateNick,
	validatePass,
	bodyNotEmpty,
} = require('../../validations');

router.get('/', authController.getRegister);

//  input
// {
//   nickname:String,
//   email:String,
//   password:String
// }

// router.post(
// 	'/register',
// 	bodyNotEmpty,
// 	[validateEmail, validateNick, validatePass],
// 	authController.postRegister
// );

router.post('/register', (req, res) => {
	try {
		// console.log('\n \n', res);
		console.log('\n \n', req);
		// console.log('\n \n', req.body);
	} catch (e) {
		console.log('err');
	}
});

// call service layer

// ###############################
router.get('/', (req, res) => {
	res.status(400).json();
});
// ###############################

module.exports = router;
