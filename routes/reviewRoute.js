const Express = require('express');
const { model } = require('mongoose');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = Express.Router({ mergeParams: true });

//POST /tour/ad343/reviews
//GET /tour/ad32/reviews
//GET /tour/ad233/reviews/add31.

router.route(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourId,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  );

module.exports = router;
