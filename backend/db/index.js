// require('./Users');

// const authService = require('./service-auth');
// const relationsService = require('./service-relations');
// // const  = require('./')
// // const  = require('./')
// // const  = require('./')
// // const  = require('./')

// module.exports = {
// 	authService,
// 	relationsService,
// };
const userDB = require('./db-user');
const friendDB = require('./db-friend');

module.exports = {
	userDB,
	friendDB,
};
