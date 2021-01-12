require("dotenv").config();
const nodemailer = require("nodemailer");
const EMAIL = process.env.EMAIL;

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendMail(address, subject = "", anchorURL = "", achorText = "") {
  if (!process.env.TEST) {
    let mailOptions = {
      from: `"tSNS" <${EMAIL}>`,
      to: address,
      subject: subject,
      html: `<div >
      <h1>tSNS</h1>
      <a href="${anchorURL}">
      <h3>
      ${achorText}
      </h3>
      </a>
      <a href="https://www.linkedin.com/in/jiwoo-jeon-4148861b7/">my LinkedIn</a>

    </div>`,
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
