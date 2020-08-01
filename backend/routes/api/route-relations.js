// const express = require('express');
// const router = express.Router();
// const { relationsController } = require('../../controllers/index');
// const { verifyAccessToken, verifyRefreshToken } = require('../../middlewares');
// const {
// 	validateEmail,
// 	validateNick,
// 	validatePass,
// 	validate,
// 	fieldsExist,
// } = require('../../utils/validations');

// //  input
// // {
// //   nickname:String,
// //   email:String,
// //   password:String
// // }
// router.post(
// 	'/register',
// 	[validateEmail, validateNick, validatePass],
// 	validate,
// 	authController.postRegister
// );

// router.post(
// 	'/login',
// 	fieldsExist(['email', 'password']),
// 	validate,
// 	authController.postLogin
// );

// router.post('/logout', verifyRefreshToken, authController.postLogout);

// router.post('/token', verifyRefreshToken, authController.postToken);

// // call service layer

// // ###############################
// // router.get('/', verifyAccessToken, (req, res) => {
// // 	console.log('authed user inside');
// // 	res.status(400).json();
// // });

// // TESTING ONLY
// // ###############################
// // ###############################
// router.get('/', (req, res) => {
// 	console.log('inside GET api/auth');
// 	res.status(200).send('in GET api/auth');
// });

// router.get('/reset', authController.getRegister);
// // ###############################
// // ###############################

// module.exports = router;
