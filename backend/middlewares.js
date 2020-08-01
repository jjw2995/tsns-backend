const jwt = require('jsonwebtoken');
const { Interface } = require('readline');

const verifyAccessToken = function (req, res, next) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	// Bearer TOKEN
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		console.log('\n', 'in verifyAccessTok');
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

const verifyRefreshToken = function (req, res, next) {
	let token = req.body.refreshToken;
	if (token == null) return res.sendStatus(400);

	jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		// console.log('\n', 'in verifyRefreshToken');
		// console.log('\n', user);
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

module.exports = {
	verifyAccessToken,
	verifyRefreshToken,
};
