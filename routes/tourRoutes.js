const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

//check middleware for valid id
// router.param('id', tourRouters.checkId);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//Create a checkBody middleware
//Check if the body contains the name and price property
//If not , send back 400(bad request)
//Add it to the post handler stack
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id/:b?')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// console.log(typeof router);

module.exports = router;
