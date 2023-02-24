// "use strict";
/* eslint-disable */

var multer = require('multer');

var sharp = require('sharp');

var User = require('../models/userModel');

var APIFeatures = require('../utils/apiFeatures');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

var factory = require('./handlerFactory');

exports.express = require('express');

var filterObj = function filterObj(obj) {
  for (
    var _len = arguments.length,
      allowedFields = new Array(_len > 1 ? _len - 1 : 0),
      _key = 1;
    _key < _len;
    _key++
  ) {
    allowedFields[_key - 1] = arguments[_key];
  }

  var newObj = {};
  Object.keys(obj).forEach(function (el) {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}; // cb is for errors
//cb args :  1.error, 2.required goal, like destination or filename
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     // cb(null, `${Date.now()}--${file.originalname}`);
//   },
// });

var multerStorage = multer.memoryStorage(); // //To test if uploaded file is an image
// //to test if particular uploaded files are of imgaes or csv etc

var multerFilter = function multerFilter(req, file, cb) {
  //1. if the file is image, we pass in cb "true" else "false".
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    var x = new AppError('not an image! Please upload only images', 400);
    cb(x, false);
  }
};

var upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch ((_context.prev = _context.next)) {
        case 0:
          if (req.file) {
            _context.next = 2;
            break;
          }

          return _context.abrupt('return', next());

        case 2:
          req.file.filename = 'user-'
            .concat(req.user.id, '-')
            .concat(Date.now(), '.jpeg');
          _context.next = 5;
          return regeneratorRuntime.awrap(
            sharp(req.file.buffer)
              .resize(500, 500)
              .toFormat('jpeg')
              .jpeg({
                quality: 90,
              })
              .toFile('public/img/users/'.concat(req.file.filename))
          );

        case 5:
          next();

        case 6:
        case 'end':
          return _context.stop();
      }
    }
  });
}); // // exports.updateUsrPhotoMultiple = upload.multiple('multi', 3);
// exports.fileupload = upload.fields([
//   { name: 'file1', maxCount: 4 },
//   { name: 'file2', maxCount: 4 },
// ]);

exports.updateMe = catchAsync(function _callee2(req, res, next) {
  var filter, updatedUser;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch ((_context2.prev = _context2.next)) {
        case 0:
          if (!(req.body.password || req.body.passwordConfirm)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt(
            'return',
            next(
              new AppError(
                'This route is not for password updatation, please use /updateMyPassword',
                400
              )
            )
          );

        case 2:
          // 2. Update user document
          //filtering out unwanted filed names that are not allowed to change
          filter = filterObj(req.body, 'name', 'email');
          if (req.file) filter.photo = req.file.filename; //3. Update user document

          _context2.next = 6;
          return regeneratorRuntime.awrap(
            User.findByIdAndUpdate(req.user.id, filter, {
              new: true,
              runValidators: true,
            })
          );

        case 6:
          updatedUser = _context2.sent;
          res.status(200).json({
            status: 'success',
            data: {
              user: updatedUser,
            },
          });

        case 8:
        case 'end':
          return _context2.stop();
      }
    }
  });
});

exports.getMe = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(function _callee3(req, res, next) {
  var deletedUser;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch ((_context3.prev = _context3.next)) {
        case 0:
          console.log(req.user);
          _context3.next = 3;
          return regeneratorRuntime.awrap(
            User.findByIdAndUpdate(
              req.user.id,
              {
                active: false,
              },
              {
                new: true,
                runValidators: true,
              }
            )
          );

        case 3:
          deletedUser = _context3.sent;
          res.status(204).json({
            status: 'success',
            data: null,
          });

        case 5:
        case 'end':
          return _context3.stop();
      }
    }
  });
});

exports.createUser = function (req, res, next) {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please Signup !!',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
