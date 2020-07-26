const { body } = require('express-validator');

let emailMsg = { email: 'must be valid email addr' };
let passMsg = {
	password:
		'must contain #, lowercase, UPPERCASE, speci@l, and be 8 characters long',
};
let nickMsg = {
	nickname: 'must be 2~16 characters long and not contain special characters',
};

let nickRegex = /^[a-zA-Z0-9 ]{2,16}$/;
let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

const validateNick = body('nickname', nickMsg).matches(nickRegex);
const validateEmail = body('email', emailMsg).matches(emailRegex);
const validatePass = body('password', passMsg).matches(passRegex);

const bodyNotEmpty = function (req, res, next) {
	console.log('in bodyNotEmpty');
	if (!req || !req.body) {
		// console.log('Object missing');
		let err = new Error(
			JSON.toString({
				error: 'got no input',
				// errors: [emailMsg, passMsg, nickMsg],
			})
		);
		return;
		next(err);
	} else {
		next();
	}
};

module.exports = {
	validateNick,
	validateEmail,
	validatePass,
	bodyNotEmpty,
};
// [
//   body('userName', 'userName doesn\'t exists').exists(),
//   body('email', 'Invalid email').exists().isEmail(),
//   body('phone').optional().isInt(),
//   body('status').optional().isIn(['enabled', 'disabled'])
//  ]
