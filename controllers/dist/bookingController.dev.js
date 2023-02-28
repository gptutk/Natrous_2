"use strict";

var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var Tour = require('../models/tourModel');

var Booking = require('../models/bookingModel');

var catchAsync = require('../utils/catchAsync');

var AppError = require('../utils/appError');

var factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(function _callee(req, res, next) {
  var tour, session;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.findById(req.params.tourId));

        case 2:
          tour = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            success_url: "".concat(req.protocol, "://").concat(req.get('host'), "/?tour=").concat(req.params.tourId, "&user=").concat(req.user.id, "&price=").concat(tour.price),
            cancel_url: "".concat(req.protocol, "://").concat(req.get('host'), "/tour/").concat(tour.slug),
            customer_email: req.user.email,
            client_reference_id: req.params.tourID,
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: "".concat(tour.name),
                  description: tour.summary
                },
                unit_amount: tour.price * 100
              },
              quantity: 1
            }]
          }));

        case 5:
          session = _context.sent;
          //3. Create session as response
          res.status(200).json({
            status: 'success',
            session: session
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.createBookingCheckout = catchAsync(function _callee2(req, res, next) {
  var _req$query, tour, user, price;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$query = req.query, tour = _req$query.tour, user = _req$query.user, price = _req$query.price;

          if (!(!tour && !user && !price)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(Booking.create({
            tour: tour,
            user: user,
            price: price
          }));

        case 5:
          res.redirect(req.originalUrl.split('?')[0]);

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
});