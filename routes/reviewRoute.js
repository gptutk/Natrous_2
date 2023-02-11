const Express = require('express');
const { model } = require('mongoose');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = Express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
