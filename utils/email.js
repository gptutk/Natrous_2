const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');
const catchAsync = require('./catchAsync');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.EMAIL_FROM}`;
  }

  //1. Define transporter.
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SENDGRID
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
      // return nodemailer.createTestAccount({
      // host: process.env.EMAIL_HOST,
      // port: process.env.EMAIL_PORT,
      // service: 'SendGrid',
      //   auth: {
      //     user: process.env.SENDGRID_USER,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //2.SEND THE ACTUAL EMAIL.
  async send(template, subject) {
    //1. Render HTML based on PUG template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //2. Define the email options.
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html,
      // text: htmlToText.fromString(html),
    };

    //3. Create a transport and send email.
    await this.newTransport().sendMail(mailOptions);
  }

  //3. send email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natrous Family ! ');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)'
    );
  }
};

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
