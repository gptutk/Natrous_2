"use strict";

/* eslint-disable no-shadow */
var path = require('path');

var fs = require('fs');

var express = require('express');

var morgan = require('morgan');

var rateLimit = require('express-rate-limit');

var mongoSanitize = require('express-mongo-sanitize');

var xss = require('xss-clean');

var hpp = require('hpp');

var cookieParser = require('cookie-parser'); // const req = require('express/lib/request');
// const res = require('express/lib/response');


var _require = require('express/lib/response'),
    status = _require.status,
    json = _require.json,
    type = _require.type;

var _require2 = require('express/lib/utils'),
    contentDisposition = _require2.contentDisposition;

var res = require('express/lib/response');

var AppError = require('./utils/appError');

var tourRouter = require('./routes/tourRoutes');

var userRouter = require('./routes/userRouters');

var reviewRouter = require('./routes/reviewRoute');

var globalErrorHandler = require('./controllers/errorController');

var viewRouter = require('./routes/viewRoutes');

var bookingsRouter = require('./routes/bookingRoute');

var _require3 = require('./utils/helmetConfig'),
    helmet = _require3.helmet,
    csp = _require3.csp;

var app = express(helmet);
csp(app);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', {
  pretty: true
}); //1) GLOBAL MIDDLEWARES.
//static file middleware

app.use(express["static"](path.join(__dirname, 'public')));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}); //Morgan here logs the every url requests that browers requests

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} //limiting ip requests, preventing DOS, Bruteforce.


var limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after 1hr'
});
app.use('/api', limiter); //Body parser, reading data from body to req.body.

app.use(express.json({
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(cookieParser()); // Data Sanitization against NoSQL query.

app.use(mongoSanitize()); //Data Sanitization against XSS attacks.

app.use(xss()); //Prevent parameter pollution

app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
})); //middleware are gonna apply to every request if specified before respond obj

app.use(function (req, res, next) {
  console.log('Hello from the middleware ');
  next();
});
app.use(function (req, res, next) {
  //defing a property on request object to add the request time
  req.requestTime = new Date().toISOString(); // console.log(req.cookies);
  // console.log(req.headers);

  next();
});
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.all('*', function (req, res, next) {
  next(new AppError("Can't find ".concat(req.originalUrl, " on this server"), 404));
}); //Global error handling middleware.

app.use(globalErrorHandler);
module.exports = app;