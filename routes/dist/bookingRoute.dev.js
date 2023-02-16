"use strict";

var Express = require('express');

var _require = require('mongoose'),
    model = _require.model;

var bookingController = require('../controllers/bookingController');

var authController = require('../controllers/authController');

var router = Express.Router({
  mergeParams: true
});
router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);
module.exports = router;