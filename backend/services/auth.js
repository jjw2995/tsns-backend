const bcrypt = require('bcryptjs');
const User = require('mongoose').model('User');
const { isValidEmail, isValidNick, isValidPassword } = require('./helper');
/*
 * if you need to make calls to additional tables, data stores (Redis, for example),
 * or call an external endpoint as part of creating the blogpost, add them to this service
 */

//  input
// {
//   nickname:String,
//   email:String,
//   password:String
// }

function registerUser(user, done) {
  console.log('\n', user);
  let errArr = [];
  isValidEmail(user.email, errArr);
  isValidNick(user.nickname, errArr);
  isValidPassword(user.password, errArr);

  if (errArr.length > 0) {
    return new Error(JSON.stringify({ errors: errArr }));
  }

  user.salt = = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, user.salt)
  console.log('\n', user);
  console.log('\n', "should see {nick, password, email, hash}");

  User.create(user).then((dbUserDoc) => {
    console.log('\n', dbUserDoc, '\n');
    return done(null, {_id: dbUserDoc._id, ACCESS_TOKEN: , REFRESH_TOKEN: , });
    // return done(null, {_id: dbUserDoc._id, ACCESS_TOKEN: , REFRESH_TOKEN: , });
  }).catch((e)=>{
    return done(null, x);
  })
}




module.exports = {
  registerUser,
};


// d(0, (err, res) => {
//   console.log(err.message);
// });

// {
//   nickname: { type: String, required: [true, 'cannot be blank'], trim: true },
//   birthday: Date,
//   email: {
//     type: String,
//     required: [true, 'email cannot be blank'],
//     unique: [true, 'email must be unique'],
//     trim: true,
//   },
//   password: {
//     type: String,
//   },
//   salt: { type: String, required: true },
// },
// { timestamps: true },
// )



// function d(x, done) {
//   if (x == 0) {
//     let e = new Error();
//     return done(new Error(JSON.stringify({ errors: { asd: 'asd' } })));
//   } else return done(null, x);
// }
