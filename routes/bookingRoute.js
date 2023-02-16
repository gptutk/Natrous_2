const Express = require('express');
const { model } = require('mongoose');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = Express.Router({ mergeParams: true });

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession
);

module.exports = router;
