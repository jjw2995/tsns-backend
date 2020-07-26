const { authService } = require('../services');
/*
 * call other imported services, or same service but different functions here if you need to
 */

const postRegister = (req, res) => {
	authService
		.registerUser(req.body)
		.then((newUser) => res.status(200).json(newUser))
		.catch((e) => res.status(400).json(e));
};

//=======

const getRegister = (req, res) => {
	res.send('in GET api/auth');
};

module.exports = {
	postRegister,
	getRegister,
};

//#

// const postBlogpost = async (req, res, next) => {
//   const {user, content} = req.body
//   try {
//     await createBlogpost(user, content)
//     // other service call (or same service, different function can go here)
//     // i.e. - await generateBlogpostPreview()
//     res.sendStatus(201)
//     next()
//   } catch(e) {
//     console.log(e.message)
//     res.sendStatus(500) && next(error)
//   }
// }
