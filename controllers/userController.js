const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.express = require('express');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// cb is for errors
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

const multerStorage = multer.memoryStorage();
// //To test if uploaded file is an image
// //to test if particular uploaded files are of imgaes or csv etc

const multerFilter = (req, file, cb) => {
  //1. if the file is image, we pass in cb "true" else "false".
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    const x = new AppError('not an image! Please upload only images', 400);
    cb(x, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// // exports.updateUsrPhotoMultiple = upload.multiple('multi', 3);

// exports.fileupload = upload.fields([
//   { name: 'file1', maxCount: 4 },
//   { name: 'file2', maxCount: 4 },
// ]);

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1. create error if user tries to post PASSWORD data.
  // console.log(req.file);
  // console.log(req.body);
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updatation, please use /updateMyPassword',
        400
      )
    );
  }
  // 2. Update user document
  //filtering out unwanted filed names that are not allowed to change
  const filter = filterObj(req.body, 'name', 'email');
  if (req.file) filter.photo = req.file.filename;

  //3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filter, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const deletedUser = await User.findByIdAndUpdate(
    req.user.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please Signup !!',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
