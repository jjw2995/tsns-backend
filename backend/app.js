const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
require('./db/Users');

//  Connect all our routes to our application
app.use('/api', require('./routes/api'));

// error handling middleware
// app.use(function (error, req, res, next) {
// 	console.log('in err handler', '\n');
// 	console.log(error);
// 	res.status(400).json(error);
// 	return;
// });

const server = app.listen(PORT, () =>
	console.log(`\n BACKEND ON PORT - http://localhost:${PORT}`)
);

let dbp = 'mongodb://localhost:27017';
mongoose.connect(
	dbp,
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
	() => console.log(` mongoDB connected on - ${dbp}`)
);
