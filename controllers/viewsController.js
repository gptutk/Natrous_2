const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get the tour data from the collection
  const tours = await Tour.find();
  //2. Build Template
  //3. Render that template using tour data from 1st step

  res.status(200).render('overview', {
    title: 'All tours',
    tours: tours,
  });
});

exports.tour = catchAsync(async (req, res, next) => {
  //1. Get the data, for the requested tour, including review and guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('This tour does not exist', 404));
  }
  console.log('🤡🤡🤡🤡');
  //2. Build template

  //3. render template using the data from 1st step.
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com'
    )
    .render('tour', {
      title: `${tour.name}`,
      tour,
    });
});

exports.getLoginForm = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: `Your account`,
  });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
