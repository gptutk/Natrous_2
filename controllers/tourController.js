const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const Tour = require('../models/tourModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

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

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  const imageCoverFileName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFileName}`);

  req.body.imageCover = imageCoverFileName;

  //2. for images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  console.log(req.body);
  next();
});
// //for a single image
// upload.single('image');

// // for multiple images
// upload.array('images', 5);
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res) => {
  //aggregation pipeline is similar to a query
  //here we define a number of steps to work on a query
  //we pass in an array of stages, through which the document passes
  // Each stage is an object
  // the resolved value is returned.
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      //group allows us to group documents together, using accumulators
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: null,
        // _id2: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRatingskasum: { $sum: '$ratingsQuantity' },
        avgRatingkaavg: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      //-1 for descending and 1 for ascending
      $sort: { avgPrice: -1 },
    },
    //matching multiple times
    // {
    //   $match: {
    //     _id: { $ne: 'EASY' },
    //   },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  // eslint-disable-next-line prefer-destructuring
  const year = req.params.year;

  const plan = await Tour.aggregate([
    {
      //
      $unwind: '$startDates',
    },
  ]);

  res.status(200).json({
    status: 'success',
    body: {
      plan,
    },
  });
});
