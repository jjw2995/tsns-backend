require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
require('./db')

//  Connect all our routes to our application
app.use('/api', require('./routes/api'))

// error handling middleware
// app.use(function (error, req, res, next) {
// 	console.log('in err handler', '\n');
// 	console.log(error);
// 	res.status(400).json(error);
// 	return;
// });
// app.listen();

let dbp = 'mongodb://localhost:27017'
let p1 = new Promise((resolve, reject) => {
	mongoose.connect(
		dbp,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		},
		(e) => {
			if (e) reject()
			// console.log(` mongoDB connected on - ${dbp}`);
			resolve()
		}
	)
})

let p2 = new Promise((resolve, reject) => {
	app.listen(PORT, () => {
		// console.log(`\n BACKEND ON PORT - http://localhost:${PORT}`);
		resolve()
		// console.log(process.env.ACCESS_TOKEN_SECRET);
	})
})

Promise.all([p1, p2])
	.then(console.log('\n app and db running...'))
	.catch((e) => console.log(e))

module.exports = app
