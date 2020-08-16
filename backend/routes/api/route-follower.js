const express = require('express');
const router = express.Router();
const { FollowerController } = require('../../controllers/index');
const { verifyAccessToken } = require('../../middlewares');
// const {
// 	validateEmail,
// 	validateNick,
// 	validatePass,
// 	validate,
// 	fieldsExist,
// } = require('../../utils/validations');

router.use(verifyAccessToken);

let followerController = new FollowerController();

/**			api/followers
 */

// body = user
router.post('/', followerController.post);

// body = user
router.delete('/', followerController.delete);

router.post(
	'/accept',
	// (q, w, e) => {
	// 	console.log(q.body);
	// 	e();
	// },
	followerController.postAccept
);

router.get('/', followerController.get);

router.get('/waiting', followerController.getWaiting);

router.get('/pending', followerController.getPending);

// router.post('/accept', followerController.accept);
// router.get('/',(req,res)=>{
// 	res.sendFile
// })

module.exports = router;
