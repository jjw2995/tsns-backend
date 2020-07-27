const { body, validationResult } = require('express-validator');

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
const validateEmail = body('email', emailMsg)
	.matches(emailRegex)
	.normalizeEmail();
const validatePass = body('password', passMsg).matches(passRegex);

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}
	const extractedErrors = [];

	// why does map work while forLoop shows undefined for err.msg?
	errors.array().map((err) => {
		console.log(err.msg);
		extractedErrors.push({ [err.param]: err.msg });
	});

	return res.status(422).json({
		errors: extractedErrors,
	});
};

// const filterObjKeyValPair = (obj, keys) => {
// 	return keys.reduce((acc,key)=>{})
// }

module.exports = {
	validateNick,
	validateEmail,
	validatePass,
	validate,
};
// [
//   body('userName', 'userName doesn\'t exists').exists(),
//   body('email', 'Invalid email').exists().isEmail(),
//   body('phone').optional().isInt(),
//   body('status').optional().isIn(['enabled', 'disabled'])
//  ]
