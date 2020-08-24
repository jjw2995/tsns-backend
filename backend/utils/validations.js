const { body, validationResult } = require('express-validator');

let emailMsg = { email: 'must be valid email addr' };
let passMsg = {
	password:
		'must contain a number, lowercase, UPPERCASE, special, and be 8 characters long',
};
let nickMsg = {
	nickname: 'must be 2~16 characters long and not contain special characters',
};

let nickRegex = /^[a-zA-Z0-9 ]{2,16}$/;
let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,15})/;

const fieldsExist = (fields) => {
	let v = fields.map((field) => {
		return fieldExists(field);
	});
	return v;
};

const fieldExists = (field) => {
	let msg = { [field]: 'field is missing or empty' };
	return body(field, msg).exists({
		checkFalsy: true,
	});
};
const validateNick = body('nickname', nickMsg).matches(nickRegex).exists();
const validateEmail = body('email', emailMsg)
	.matches(emailRegex)
	.normalizeEmail()
	.exists();
const validatePass = body('password', passMsg).matches(passRegex).exists();

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		return next();
	}
	let extractedErrors = [];

	// why does map work while forLoop shows undefined for err.msg?
	extractedErrors = mapErrors(errors, extractedErrors);

	return res.status(400).json({
		statusCode: 400,
		error: 'Bad Request',
		errors: extractedErrors,
	});
};

function mapErrors(errors, extractedErrors) {
	console.log(errors);
	errors.array().map((err) => {
		let key = err.param;
		extractedErrors.push({ [key]: err.msg[key] });
	});
	return extractedErrors;
}

// const filterObjKeyValPair = (obj, keys) => {
// 	return keys.reduce((acc,key)=>{})
// }

module.exports = {
	validateNick,
	validateEmail,
	validatePass,
	validate,
	fieldsExist,
};
// [
//   body('userName', 'userName doesn\'t exists').exists(),
//   body('email', 'Invalid email').exists().isEmail(),
//   body('phone').optional().isInt(),
//   body('status').optional().isIn(['enabled', 'disabled'])
//  ]
