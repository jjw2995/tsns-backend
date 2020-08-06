const { FriendService } = require('../services')
const mongoose = require('mongoose')
const Friend = mongoose.model('Friend')
let friendService = new FriendService(Friend)

const getHello = (req, res) => {
	friendService
		.hello()
		.then((d) => {
			res.status(200).json('in relation-controller')
		})
		.catch((e) => {
			console.log('error in getHello Control')
			log
		})
}



module.exports = {
	getHello,
	// hi,
}
