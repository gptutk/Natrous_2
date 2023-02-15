const fs = require('fs');
const Tour = require('../models/tourModel');

const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');

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
