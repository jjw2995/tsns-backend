const expressValidator = require('express-validator');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(expressValidator());
require('./db/Users');

//  Connect all our routes to our application
app.use('/api', require('./routes/api'));

const server = app.listen(PORT, () =>
  console.log(`\n BACKEND ON PORT - http://localhost:${PORT}`)
);

let dbp = 'mongodb://localhost:27017';
mongoose.connect(
  dbp,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => console.log(` mongoDB connected on - ${dbp}`)
);
