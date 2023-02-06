const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  //1. create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2. create email options
  const mailOptions = {
    from: 'Utkarsh <utkarsh@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    //html:
  };

  //3. send email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
//gmail service
// const sendEmail = (options) => {
//     //1. create transporter
//     const transporter = nodemailer.createTransport({
//if nodemailer supports a service then define it like this, or else specify port and host
//       service: 'Gmail',
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         password: process.env.EMAIL_PASSWORD,
//       },
//Activate in gmail "less secure app" option
//     });
//     //2. create email options
//     //3. send email
//   };
