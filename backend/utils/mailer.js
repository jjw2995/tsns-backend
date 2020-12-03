require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendMail(address, subject = "", text = "") {
  log(process.env.TEST);
  if (!process.env.TEST) {
    let mailOptions = {
      from: "tsns",
      to: address,
      subject: subject,
      text: text,
    };

    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log(data);
      }
    });
  }
}
module.exports = {
  sendMail,
};
