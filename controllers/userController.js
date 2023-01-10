exports.express = require('express');
const multer = require('multer');
// const AppError = require('./../utils/appError');

// const upload = multer({ dest: 'public/img/users' });
// cb is for errors
//cb 1.error, 2.required goal, like destination or filename

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },

  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    // cb(null, `${Date.now()}--${file.originalname}`);
  },
});

//Incomplete multerFilter.

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  }
  // } else {
  //   const x = new AppError('not an image! Please upload only images', 400);
  //   cb(x, false);
  // }
};

const upload = multer({
  storage: multerStorage,
  // fileFilter: multerFilter,
});

exports.updateUsrPhoto = upload.single('photo');
// exports.updateUsrPhotoMultiple = upload.multiple('multi', 3);

exports.fileupload = upload.fields([
  { name: 'file1', maxCount: 4 },
  { name: 'file2', maxCount: 4 },
]);

//To test if uploaded file is an image
//to test if particular uploaded files are of imgaes or csv etc

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
