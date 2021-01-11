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
  console.log(address);
  console.log(subject);
  console.log(anchorURL);
  if (!process.env.TEST) {
    let mailOptions = {
      // cannot change from: name due to Gmail restrictions
      from: `"tSNS" <${EMAIL}>`,
      to: address,
      subject: subject,
      // text: text,
      // <h6 style={{ padding: "0rem", margin: "0rem" }}>tiny SNS, for my resume</h6>
      html: `<div >
      <h1 >tSNS</h1>
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
