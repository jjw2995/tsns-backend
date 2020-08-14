const { FollowerService } = require('../services');
const mongoose = require('mongoose');
const Friend = mongoose.model('Friend');
let followerService = new FollowerService(Friend);

const getHello = (req, res) => {
	followerService
		.hello()
		.then((d) => {
			res.status(200).json('in relation-controller');
		})
		.catch((e) => {
			log;
		});
};

module.exports = {
	getHello,
};
