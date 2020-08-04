// const { friendService } = require('../services');
const { FriendService } = require('../services');
// import FriendService from '../services';
const mongoose = require('mongoose');
// import mongoose from 'mongoose';
const Friend = mongoose.model('Friend');
// import Friend from mongoose.model('Friend');
/*
 * call other imported services, or same service but different functions here if you need to
 */
let friendService = new FriendService(Friend);
// friendService.

const getHello = (req, res) => {
	friendService
		.hello()
		.then((d) => {
			res.status(200).json('in relation-controller');
		})
		.catch((e) => {
			console.log('error in getHello Control')
			log
		})
};

// const hi = (req, res) => {
// 	friendService
// 		.hi()
// 		.then((d) => res.status(200).json(d))
// 		.catch((e) => console.log(e));
// };

module.exports = {
	getHello,
	// hi,
};

// const postRegister = (req, res) => {
// 	authService
// 		.registerUser(req.body)
// 		.then((newUser) => res.status(200).json(newUser))
// 		.catch((e) => {
// 			// console.log(e);
// 			res.status(400).json(e.message);
// 		});
// };

// const router = require('express').Router();
// router.get('/rel-first', (req,res)=>{
// 	req.
// 	res.
// });
