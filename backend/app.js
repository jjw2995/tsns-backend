require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const { errors } = require("celebrate");
const { urlencoded } = require("express");

const formData = require("express-form-data");
const PORT = process.env.PORT || 5000;

global.log = (msg) => console.log("\n", msg);

// =================== SWAGGER DOC =========================
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
// =================== SWAGGER DOC =========================

app.use(express.json());
app.use(urlencoded({ extended: true }));

// parse data with connect-multiparty.
app.use(formData.parse({ extended: true, autoClean: true }));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// // change the file objects to fs.ReadStream
// app.use(formData.stream());
// // union the body and the files
// app.use(formData.union());

// app.use((req, res, next) => {
// 	console.log('\n\n', req.method, ' ', req.path /* , req.headers */);
// 	next();
// });

require("./db");

// // for logging purposes
// app.use((req, res, next) => {
//   res.on("finish", () => {
//     console.log("\n\n", req.method, " ", req.path /* , req.headers */);
//     console.log(res.body);
//   });
//   next();
// });

//  Connect all our routes to our application
app.use("/api", require("./routes/api"));

// celebrate error handler middleware
app.use(errors());

let dbp = "mongodb://localhost:27017";
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
      if (e) reject();
      // console.log(` mongoDB connected on - ${dbp}`);
      resolve();
    }
  );
});

let p2 = new Promise((resolve, reject) => {
  app.listen(PORT, () => {
    // console.log(`\n BACKEND ON PORT - http://localhost:${PORT}`);
    resolve();
  });
});

Promise.all([p1, p2])
  .then(() => {
    // console.log('\n app and db running...');
  })
  .catch((e) => console.log(e));

module.exports = app;
