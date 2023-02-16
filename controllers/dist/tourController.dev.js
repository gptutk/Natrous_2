// 'use strict';
/* eslint-disable */

var multer = require('multer');

var sharp = require('sharp');

var fs = require('fs');

var Tour = require('../models/tourModel');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

var factory = require('./handlerFactory');

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
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
exports.resizeTourImages = catchAsync(function _callee2(req, res, next) {
  var imageCoverFileName;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch ((_context2.prev = _context2.next)) {
        case 0:
          if (!(!req.files.imageCover || !req.files.images)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt('return', next());

        case 2:
          imageCoverFileName = 'tour-'
            .concat(req.params.id, '-')
            .concat(Date.now(), '-cover.jpeg');
          _context2.next = 5;
          return regeneratorRuntime.awrap(
            sharp(req.files.imageCover[0].buffer)
              .resize(2000, 1333)
              .toFormat('jpeg')
              .jpeg({
                quality: 90,
              })
              .toFile('public/img/tours/'.concat(imageCoverFileName))
          );

        case 5:
          req.body.imageCover = imageCoverFileName; //2. for images

          req.body.images = [];
          _context2.next = 9;
          return regeneratorRuntime.awrap(
            Promise.all(
              req.files.images.map(function _callee(file, i) {
                var filename;
                return regeneratorRuntime.async(function _callee$(_context) {
                  while (1) {
                    switch ((_context.prev = _context.next)) {
                      case 0:
                        filename = 'tour-'
                          .concat(req.params.id, '-')
                          .concat(Date.now(), '-')
                          .concat(i + 1, '.jpeg');
                        _context.next = 3;
                        return regeneratorRuntime.awrap(
                          sharp(file.buffer)
                            .resize(2000, 1333)
                            .toFormat('jpeg')
                            .jpeg({
                              quality: 90,
                            })
                            .toFile('public/img/tours/'.concat(filename))
                        );

                      case 3:
                        req.body.images.push(filename);

                      case 4:
                      case 'end':
                        return _context.stop();
                    }
                  }
                });
              })
            )
          );

        case 9:
          console.log(req.body);
          next();

        case 11:
        case 'end':
          return _context2.stop();
      }
    }
  });
}); // //for a single image
// upload.single('image');
// // for multiple images
// upload.array('images', 5);

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {
  path: 'reviews',
});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(function _callee3(req, res) {
  var stats;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch ((_context3.prev = _context3.next)) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(
            Tour.aggregate([
              {
                $match: {
                  ratingsAverage: {
                    $gte: 4.5,
                  },
                },
              },
              {
                //group allows us to group documents together, using accumulators
                $group: {
                  _id: {
                    $toUpper: '$difficulty',
                  },
                  // _id: null,
                  // _id2: '$ratingsAverage',
                  numTours: {
                    $sum: 1,
                  },
                  numRatingskasum: {
                    $sum: '$ratingsQuantity',
                  },
                  avgRatingkaavg: {
                    $avg: '$ratingsAverage',
                  },
                  avgPrice: {
                    $avg: '$price',
                  },
                  minPrice: {
                    $min: '$price',
                  },
                  maxPrice: {
                    $max: '$price',
                  },
                },
              },
              {
                //-1 for descending and 1 for ascending
                $sort: {
                  avgPrice: -1,
                },
              }, //matching multiple times
              // {
              //   $match: {
              //     _id: { $ne: 'EASY' },
              //   },
              // },
            ])
          );

        case 2:
          stats = _context3.sent;
          res.status(200).json({
            status: 'success',
            data: {
              stats: stats,
            },
          });

        case 4:
        case 'end':
          return _context3.stop();
      }
    }
  });
});
exports.getMonthlyPlan = catchAsync(function _callee4(req, res) {
  var year, plan;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch ((_context4.prev = _context4.next)) {
        case 0:
          // eslint-disable-next-line prefer-destructuring
          year = req.params.year;
          _context4.next = 3;
          return regeneratorRuntime.awrap(
            Tour.aggregate([
              {
                //
                $unwind: '$startDates',
              },
            ])
          );

        case 3:
          plan = _context4.sent;
          res.status(200).json({
            status: 'success',
            body: {
              plan: plan,
            },
          });

        case 5:
        case 'end':
          return _context4.stop();
      }
    }
  });
});
