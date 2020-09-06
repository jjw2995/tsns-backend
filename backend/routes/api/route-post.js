const express = require('express');
const router = express.Router();
const { PostController } = require('../../controllers/index');
const { verifyAccessToken } = require('../../middlewares');
router.use(verifyAccessToken);

// =============================================================================
// =============================================================================
// =============================================================================
// const a = require('uuid');

// const { Storage } = require('@google-cloud/storage');
// const path = require('path');
// const { time } = require('console');

// router.post('/test', async (req, res) => {
// 	// gc.b;
// 	let a = gc.bucket('tsns');
// 	let fileArr = Object.entries(req.files);
// 	// console.log(req.files);
// 	console.log(Date.now());
// 	console.log(Date.now() + 600);
// 	let file = a.file('test');
// 	// a.file
// 	let b = await file.getSignedUrl({
// 		expires: Date.now() + 600,
// 		action: 'read',
// 	});
// 	console.log(b);

// 	let c = await file.get();
// 	console.log(c);

// 	res.sendStatus(200);
// });
// =============================================================================
// =============================================================================
// =============================================================================

let postController = new PostController();

/**			api/posts
 */

// for JOI validation

/**
 * body {
 * description
 * media <up to 4 urls>
 * level
 * }
 */
router.post('/', postController.post);

/**
 * body{
 * _id
 * }
 */
router.delete('/', postController.delete);

/**
 * body {
 * _id <post _id>
 * desription
 * }
 */
router.patch('/', postController.patch);

// let limit = req.query.limit ???
router.get('/', postController.get);

router.get('/mine', postController.getMine);

// let limit = req.query.limit ???
router.get('/explore', postController.getExplore);

module.exports = router;
