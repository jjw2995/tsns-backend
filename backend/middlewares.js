// let emailMsg = { email: 'must be valid email addr' };
// let passMsg = {
// 	password:
// 		'must contain #, lowercase, UPPERCASE, speci@l, and be 8 characters long',
// };
// let nickMsg = {
// 	nickname: 'must be 2~16 characters long and not contain special characters',
// };

// const bodyNotEmpty = function (req, res, next) {
// 	console.log('in bodyNotEmpty');
// 	if (!req || !req.body) {
// 		// console.log('Object missing');
// 		let err = new Error({
// 			error: 'got no input',
// 			errors: [emailMsg, passMsg, nickMsg],
// 		});
// 		throw err;
// 		next();
// 	} else {
// 		next();
// 	}
// };

// module.exports = {
// 	bodyNotEmpty,
// };
// // [
// //   body('userName', 'userName doesn\'t exists').exists(),
// //   body('email', 'Invalid email').exists().isEmail(),
// //   body('phone').optional().isInt(),
// //   body('status').optional().isIn(['enabled', 'disabled'])
// //  ]
