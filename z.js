// // const serv = require('./backend/services/auth-service');

// module.exports = (db) => {
// 	let authUsers = [];
// 	serv.info = (x) => {
// 		console.log(x);
// 	};
// 	serv.base = (b) => {
// 		console.log(b);
// 	};
// 	serv.test = (c) => {
// 		console.log(c);
// 	};
// 	return serv;
// };
// import Test from './x';
const Test = require('./x');

let t = new Test('in importing file');
t.pr();
