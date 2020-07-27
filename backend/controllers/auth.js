const { authService } = require('../services');
/*
 * call other imported services, or same service but different functions here if you need to
 */

const postRegister = (req, res) => {
	authService
		.registerUser(req.body)
		.then((newUser) => res.status(200).json(newUser))
		.catch((e) => {
			console.log(e);
			res.status(400).json(e.message);
		});
};

//=======
const User = require('mongoose').model('User');
const getRegister = (req, res) => {
	User.deleteMany({}, (err, output) => {
		if (err) {
			console.log(err);
		} else {
			res.json(output);
		}
	});
};

module.exports = {
	postRegister,
	getRegister,
};
