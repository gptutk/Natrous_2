"use strict";

var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var Tour = require('../models/tourModel');

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
            success_url: "".concat(req.protocol, "://").concat(req.get('host'), "/"),
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