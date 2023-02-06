const fs = require('fs');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
//catching the erros of async fn.
// eslint-disable-next-line arrow-body-style

/* eslint-disable prefer-object-spread */
exports.getAllTours = catchAsync(async (req, res) => {
  //Here our requested query is stored in req.query in the form of a object
  console.log(req.query, '🙃');
  console.log(req.params, '😺🎃');
  console.log(req.query.fields);
  console.log(typeof Tour, '🤨');
  // console.log(Tour.find());
  console.log(typeof Tour.find(), '😀');

  //EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  //Final query execution, before this step, middleware query is executed
  const tours = await features.query;
  // console.log(tours);
  console.log(typeof tours, '👍');

  // const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');
  //SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  //the above works as : Tour.findOne({_id : req.params.id})

  if (!tour) {
    next(new AppError('no tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  // const newTour = new Tour({});
  // newTour.save();

  console.log(req.body);
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tours: newTour,
    },
  });
});

exports.updateTour = async (req, res) => {
  try {
    // console.log(req.body);
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        //here property name has same name as value , so we can just use
        // tour instead.
        // tour: tour,
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      next(new AppError('no tour found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'invalid id',
      error: err,
    });
  }
};

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = 'price,-ratingsAverage';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
