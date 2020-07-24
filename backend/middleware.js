// // const User = require('mongoose').model('User');
// const router = require('express').Router();
// const bcrypt = require('bcrypt-nodejs');
// const jwt = require('jsonwebtoken');
// // const { body, validationResult } = require('express-validator');
// const { checkPushErr } = require('../../helper');

// router.get('/', (req, res) => {
//   User.find().then((users) => {
//     console.log(users);
//     res.json({
//       data: users,
//     });
//   });
// });

// router.get('/reset', (req, res) => {
//   User.deleteMany({}, (err, d) => {
//     res.json(d);
//   });
// });

// // USE express-validator???
// router.post('/register', (req, res) => {
//   let errArr = [];
//   console.log('\n', req.body);

//   let vp = validatePassword(req.body.password);
//   let ve = validateEmail(req.body.email);
//   let vn = validateNickname(req.body.nickname);

//   let emailMsg = { email: 'must be valid email addr' };
//   let passMsg = {
//     password:
//       'must contain #, lowercase, UPPERCASE, speci@l, and be 8 characters long',
//   };
//   let nickMsg = {
//     nickname: 'must be 2~16 characters long and not contain special characters',
//   };

//   checkPushErr(vp, passMsg, errArr);
//   checkPushErr(ve, emailMsg, errArr);
//   checkPushErr(vn, nickMsg, errArr);

//   if (!vp || !ve || !vn) {
//     return res.status(400).json({ errors: errArr });
//   }

//   let salt = bcrypt.genSaltSync(10);
//   let hashedPassword = bcrypt.hashSync(req.body.password, salt);

//   req.body.password = hashedPassword;
//   req.body.salt = salt;
//   console.log('\n appended body -see if it worked');
//   console.log(req.body);

//   console.log('\n appended body -see if it worked');

//   User.create(req.body)
//     .then((result) => {
//       console.log('\n one inside DB');
//       console.log(result);
//       res.status(201).json({_id: result._id, ACCESS_TOKEN: , REFRESH_TOKEN: , });
//     })
//     .catch((e) => {
//       console.log(e);
//       res.status(400).json({ errors: { email: 'already exists' } });
//     });
// });

// router.post('/login', (req, res) => {});

// function validatePassword(password) {
//   const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
//   return re.test(String(password));
// }

// // must at least contain one #, lowercase, UPPERCASE, speci@l ch@r@cter, and 8 characters long'
// function validateEmail(email) {
//   const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(String(email).toLowerCase());
// }

// function validateNickname(nickname) {
//   const re = /^[a-zA-Z0-9 ]{2,16}$/;
//   return re.test(String(nickname));
// }

// module.exports = router;