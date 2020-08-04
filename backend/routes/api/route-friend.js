const express = require('express')
const router = express.Router()
const { friendController } = require('../../controllers/index')
const { verifyAccessToken, verifyRefreshToken } = require('../../middlewares')
const {
	validateEmail,
	validateNick,
	validatePass,
	validate,
	fieldsExist,
} = require('../../utils/validations')

router.get('/hello', friendController.getHello)

// router.get('/hi', friendController.hi);

//  input
// {
//   nickname:String,
//   email:String,
//   password:String
// }
// router.post(
// 	'/register',
// 	[validateEmail, validateNick, validatePass],
// 	validate,
// 	authController.postRegister
// );
//
//

module.exports = router
