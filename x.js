// // // divide with callback
// // // function div(x, y, done) {
// // //   if (y === 0) return done(Error('Cannot divide by zero'));
// // //   else return done(null, x / y);
// // // }

const { Promise } = require('mongoose');

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

// if (typeof ea.sd === undefined) {
// 	console.log('in undef');
// }

// class authService {
// 	// constructor() {}
// 	register(u) {
// 		console.log(u);
// 	}
// }

// let authServ = new authService();

// authServ.register('test');
process.env.NODE_ENV = 'test';
// console.log(process.env.NODE_ENV);

// asd.authService.info;
// console.log(new Promise());
const a = () => {
	return new Promise((resolve, reject) => {
		if (0) resolve(console.log('resolve'));
		else reject(console.log('reject'));
	});
};
a()
	.catch(() => {
		console.log('catched');
		return;
	})
	.then(() => {
		console.log('then');
	});
