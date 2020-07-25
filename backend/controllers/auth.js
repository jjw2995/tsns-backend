const { authService } = require('../services');
const { body } = require('express-validator/check');
/*
 * call other imported services, or same service but different functions here if you need to
 */

const postRegister = (req, res) => {
  authService.registerUser(req.body, (newUser, err) => {
    if (err) {
      res.status(400).json(err);
    } else {
      res.status(200).json(newUser);
    }
  });

  console.log('in POST api/auth/register');
};

//=======

const getRegister = (req, res) => {
  res.send('in GET api/auth');
};

exports.validate = (method) => {
  switch (method) {
    case 'createUser': {
      return [
        body('userName', "userName doesn't exists").exists(),
        body('email', 'Invalid email').exists().isEmail(),
        body('phone').optional().isInt(),
        body('status').optional().isIn(['enabled', 'disabled']),
      ];
    }
  }
};

module.exports = {
  postRegister,
  getRegister,
};

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
