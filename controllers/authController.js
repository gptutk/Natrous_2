const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
// const { token } = require('morgan');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');

const signToken = (inputId) =>
  jwt.sign({ id: inputId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token: token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //object destructing
  const { email, password } = req.body;

  //1) Check if email and passwrod exists
  if (!email || !password)
    return next(new AppError('Please provide a valid email and password', 400));

  //2)check if user exists and password is correct

  const user = await User.findOne({ email: email }).select('+password');

  //here correctPassword is an instance method.
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Invalid email or passsword', 404));

  //3) if everything is ok, send token to client
  sendToken(user, 200, res);
});

exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'loggged_out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Checking if token if present or not
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    const arr = req.headers.authorization.split(' ');
    token = arr[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token || token === 'loggged_out') {
    return next(new AppError('You are not logged in !!', 401));
  }
  // 2. Verification of token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log({ decoded }, '👻👻👻');
  //3. Check if the user still exists

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }
  //4. Check if user changed password after the token was issued
  //not that necessary..- can be implemented later.

  console.log('hello world');
  console.log(freshUser);
  //GRANT ACCESS TO THE USER.
  req.user = freshUser;
  res.locals.user = freshUser;
  // req.user.password =
  next();
});

//Only for rendered pages.
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1. Verify Token.
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      //2. Check if the user still exists
      const freshUser = await User.findById(decoded.id);
      if (!freshUser) {
        return next();
      }

      //GRANT ACCESS TO THE USER.
      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized to perform this action', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get the email from user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('user does not exist', 404));
  }

  //generate a reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //send the token to the entered email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `forgot your password ? submit a PATCH request with your new password and password confirm to : ${resetURL}. \n If you did not forgot your password please ignore this message`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password Reset token, Valid for 10 min',
    //   message: message,
    // });

    res.status(200).json({
      status: 'success',
      message: 'token sent to email',
    });
  } catch (err) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('failed to send email, please try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //2. If token has not expired, and there is user, set the new password.
  if (!user) {
    return next(new AppError('the token has expired or Invalid', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();
  //3. Update changedPasswordAt property of the user.
  //4. Log the user in, send JWT.
  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from the collection.
  const user = await User.findById(req.user.id);
  console.log({ user });
  console.log(user.password);
  // 2) Check if the posted current password is correct.
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', 401));
  // 3) If so, update the password.
  user.password = req.body.passwordCurrent;
  user.passwordcConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) Log the user in, send JWT.
  sendToken(user, 200, res);
});
