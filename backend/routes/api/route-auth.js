const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers/index');
const { verifyAccessToken, verifyRefreshToken } = require('../../middlewares');
const {
	validateEmail,
	validateNick,
	validatePass,
	validate,
	fieldsExist,
} = require('../../utils/validations');

router.post(
	'/register',
	[validateEmail, validateNick, validatePass],
	validate,
	AuthController.postRegister
);

router.post(
	'/login',
	fieldsExist(['email', 'password']),
	validate,
	AuthController.postLogin
);

router.post('/logout', verifyRefreshToken, AuthController.postLogout);

router.post('/token', verifyRefreshToken, AuthController.postToken);

// TESTING
// ###############################
// ###############################

router.get('/reset', AuthController.getRegister);
// ###############################
// ###############################

module.exports = router;
