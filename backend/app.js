require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const app = express();

const { errors } = require("celebrate");
const { urlencoded } = require("express");

const formData = require("express-form-data");
const PORT = process.env.PORT || 5000;

global.log = (msg) => console.log("\n", msg);

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());

// parse data with connect-multiparty.
app.use(formData.parse({ extended: true, autoClean: true }));
// delete from the request all empty files (size == 0)
app.use(formData.format());
app.use(formData.union());

require("./db");

//  Connect all our routes to our application
app.use("/api", require("./routes/api"));
app.get("", (req, res) => {
  res.status(200).json("check");
});

// celebrate error handler middleware
app.use(errors());

let dbURI = process.env.TEST_DB_URI;
if (!process.env.TEST) {
  app.use(morgan("combined"));
  dbURI = process.env.DB_URI;
}

let p1 = new Promise((resolve, reject) => {
  mongoose
    .connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then((r) => {
      resolve(r);
    })
    .catch((e) => {
      console.log(e);
      reject(e);
    });
});

let p2 = new Promise((resolve, reject) => {
  app.listen(PORT, () => {
    resolve();
  });
});

Promise.all([p1, p2])
  .then(async () => {
    console.log("\n app and db running...");
  })
  .catch((e) => console.log(e));

module.exports = app;
