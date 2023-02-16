"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var nodemailer = require('nodemailer');

var htmlToText = require('html-to-text');

var pug = require('pug');

var catchAsync = require('./catchAsync');

module.exports =
/*#__PURE__*/
function () {
  function Email(user, url) {
    _classCallCheck(this, Email);

    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = "Utkarsh Gupta <".concat(process.env.EMAIL_FROM, ">");
  } //1. Define transporter.


  _createClass(Email, [{
    key: "newTransport",
    value: function newTransport() {
      if (process.env.NODE_ENV === 'production') {
        //SENDGRID
        return 1;
      }

      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } //2.SEND THE ACTUAL EMAIL.

  }, {
    key: "send",
    value: function send(template, subject) {
      var html, mailOptions;
      return regeneratorRuntime.async(function send$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              //1. Render HTML based on PUG template
              html = pug.renderFile("".concat(__dirname, "/../views/email/").concat(template, ".pug"), {
                firstName: this.firstName,
                url: this.url,
                subject: subject
              }); //2. Define the email options.

              mailOptions = {
                from: this.from,
                to: this.to,
                subject: subject,
                html: html // text: htmlToText.fromString(html),

              }; //3. Create a transport and send email.

              _context.next = 4;
              return regeneratorRuntime.awrap(this.newTransport().sendMail(mailOptions));

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    } //3. send email

  }, {
    key: "sendWelcome",
    value: function sendWelcome() {
      return regeneratorRuntime.async(function sendWelcome$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return regeneratorRuntime.awrap(this.send('welcome', 'Welcome to the Natrous Family ! '));

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);

  return Email;
}(); //gmail service
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