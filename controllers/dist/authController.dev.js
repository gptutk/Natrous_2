"use strict";

var crypto = require('crypto');

var jwt = require('jsonwebtoken');

var _require = require('util'),
    promisify = _require.promisify; // const { token } = require('morgan');


var User = require('../models/userModel');

var AppError = require('../utils/appError');

var catchAsync = require('../utils/catchAsync');

var Email = require('../utils/email');

var signToken = function signToken(inputId) {
  return jwt.sign({
    id: inputId
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

var sendToken = function sendToken(user, statusCode, res) {
  var token = signToken(user._id);
  var cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user
    }
  });
};

exports.signup = catchAsync(function _callee(req, res, next) {
  var newUser, url;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role
          }));

        case 2:
          newUser = _context.sent;
          url = "".concat(req.protocol, "://").concat(req.get('host'), "/me");
          console.log(url);
          _context.next = 7;
          return regeneratorRuntime.awrap(new Email(newUser, url).sendWelcome());

        case 7:
          sendToken(newUser, 201, res);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.login = catchAsync(function _callee2(req, res, next) {
  var _req$body, email, password, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          //object destructing
          _req$body = req.body, email = _req$body.email, password = _req$body.password; //1) Check if email and passwrod exists

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Please provide a valid email and password', 400)));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 5:
          user = _context2.sent;
          _context2.t0 = !user;

          if (_context2.t0) {
            _context2.next = 11;
            break;
          }

          _context2.next = 10;
          return regeneratorRuntime.awrap(user.correctPassword(password, user.password));

        case 10:
          _context2.t0 = !_context2.sent;

        case 11:
          if (!_context2.t0) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new AppError('Invalid email or passsword', 404)));

        case 13:
          //3) if everything is ok, send token to client
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.logOut = function (req, res, next) {
  res.cookie('jwt', 'loggged_out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(function _callee3(req, res, next) {
  var token, arr, decoded, freshUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // 1. Checking if token if present or not
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            arr = req.headers.authorization.split(' ');
            token = arr[1];
          } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
          }

          if (!(!token || token === 'loggged_out')) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new AppError('You are not logged in !!', 401)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JWT_SECRET));

        case 5:
          decoded = _context3.sent;
          console.log({
            decoded: decoded
          }, '👻👻👻'); //3. Check if the user still exists

          _context3.next = 9;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 9:
          freshUser = _context3.sent;

          if (freshUser) {
            _context3.next = 12;
            break;
          }

          return _context3.abrupt("return", next(new AppError('The user belonging to this token no longer exists', 401)));

        case 12:
          //4. Check if user changed password after the token was issued
          //not that necessary..- can be implemented later.
          console.log('hello world');
          console.log(freshUser); //GRANT ACCESS TO THE USER.

          req.user = freshUser;
          res.locals.user = freshUser; // req.user.password =

          next();

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //Only for rendered pages.

exports.isLoggedIn = function _callee4(req, res, next) {
  var decoded, freshUser;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!req.cookies.jwt) {
            _context4.next = 17;
            break;
          }

          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET));

        case 4:
          decoded = _context4.sent;
          _context4.next = 7;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 7:
          freshUser = _context4.sent;

          if (freshUser) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", next());

        case 10:
          //GRANT ACCESS TO THE USER.
          res.locals.user = freshUser;
          return _context4.abrupt("return", next());

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](1);
          return _context4.abrupt("return", next());

        case 17:
          next();

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 14]]);
};

exports.restrictTo = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized to perform this action', 403));
    }

    next();
  };
};

exports.forgotPassword = catchAsync(function _callee5(req, res, next) {
  var user, resetToken, resetURL, message;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context5.sent;

          if (user) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new AppError('user does not exist', 404)));

        case 5:
          //generate a reset token
          resetToken = user.createPasswordResetToken();
          _context5.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          //send the token to the entered email
          resetURL = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/users/resetPassword/").concat(resetToken);
          message = "forgot your password ? submit a PATCH request with your new password and password confirm to : ".concat(resetURL, ". \n If you did not forgot your password please ignore this message");
          _context5.prev = 10;
          // await sendEmail({
          //   email: user.email,
          //   subject: 'Your password Reset token, Valid for 10 min',
          //   message: message,
          // });
          res.status(200).json({
            status: 'success',
            message: 'token sent to email'
          });
          _context5.next = 21;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](10);
          user.passwordResetExpires = undefined;
          user.passwordResetToken = undefined;
          _context5.next = 20;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 20:
          return _context5.abrupt("return", next(new AppError('failed to send email, please try again later', 500)));

        case 21:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[10, 14]]);
});
exports.resetPassword = catchAsync(function _callee6(req, res, next) {
  var hashedToken, user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          //1. Get user based on the token
          hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context6.sent;

          if (user) {
            _context6.next = 6;
            break;
          }

          return _context6.abrupt("return", next(new AppError('the token has expired or Invalid', 400)));

        case 6:
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          user.passwordResetExpires = undefined;
          user.passwordResetToken = undefined;
          _context6.next = 12;
          return regeneratorRuntime.awrap(user.save());

        case 12:
          //3. Update changedPasswordAt property of the user.
          //4. Log the user in, send JWT.
          sendToken(user, 200, res);

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.updatePassword = catchAsync(function _callee7(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id));

        case 2:
          user = _context7.sent;
          console.log({
            user: user
          });
          console.log(user.password); // 2) Check if the posted current password is correct.

          _context7.next = 7;
          return regeneratorRuntime.awrap(user.correctPassword(req.body.passwordCurrent, user.password));

        case 7:
          if (_context7.sent) {
            _context7.next = 9;
            break;
          }

          return _context7.abrupt("return", next(new AppError('Your current password is wrong', 401)));

        case 9:
          // 3) If so, update the password.
          user.password = req.body.passwordCurrent;
          user.passwordcConfirm = req.body.passwordConfirm;
          _context7.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          // 4) Log the user in, send JWT.
          sendToken(user, 200, res);

        case 14:
        case "end":
          return _context7.stop();
      }
    }
  });
});