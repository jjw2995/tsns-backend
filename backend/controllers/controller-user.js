const { UserService } = require('./../services');
const User = require('mongoose').model('User');

let userService = new UserService(User);

module.exports = class UserController {
	postPrivate(req, res) {
		userService
			.setIsPrivate(req.user, req.body)
			.then((r) => res.status(200).json(r))
			.catch((e) => res.status(400).json(e.message));
	}
};
