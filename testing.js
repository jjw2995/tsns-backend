// // // divide with callback
// // // function div(x, y, done) {
// // //   if (y === 0) return done(Error('Cannot divide by zero'));
// // //   else return done(null, x / y);
// // // }

// // // div(6, 3, function (err, result) {
// // //   // *always* check for err
// // //   if (err) console.log('error', err.message, err.stack);
// // //   else console.log('result', result);
// // // });

// // // function d(x, done) {
// // //   if (x == 0) {
// // //     let e = new Error();
// // //     return done(
// // //       Error(
// // //         JSON.stringify({
// // //           errors: [{ asd: 'asd' }, { asd: 'asd' }, { asd: 'asd' }],
// // //         })
// // //       )
// // //     );
// // //   } else return done(null, x);
// // // }

// // // d(0, (err, res) => {
// // //   console.log(err.message);
// // // });

// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// const PORT = 5000;

// app.use(express.json());
// // require('./backend/db/Users');
// // const User = mongoose.model('User');

// //  Connect all our routes to our application
// // app.use('/api', require('./routes/api'));
// // app.get('/', (req, res) => {
// //   res.json(User.find({}));
// // });

// // User.create()

// const server = app.listen(PORT, () =>
//   console.log(`\n BACKEND ON PORT - http://localhost:${PORT}`)
// );

// // let dbp = 'mongodb://localhost:27017';
// // mongoose.connect(
// //   dbp,
// //   { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
// //   () => console.log(` mongoDB connected on - ${dbp}`)
// // );

// // console.log('\n', 'asd', '\n');

if (typeof ea.sd === undefined) {
	console.log('in undef');
}
