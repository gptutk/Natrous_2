/* eslint-disable no-shadow */
const path = require('path');
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// const req = require('express/lib/request');
// const res = require('express/lib/response');
const { status, json, type } = require('express/lib/response');
const { contentDisposition } = require('express/lib/utils');
const res = require('express/lib/response');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRouters');
const reviewRouter = require('./routes/reviewRoute');
const globalErrorHandler = require('./controllers/errorController');
const viewRouter = require('./routes/viewRoutes');
const bookingsRouter = require('./routes/bookingRoute');
const { helmet, csp } = require('./utils/helmetConfig');

const app = express(helmet);
csp(app);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('view options', { pretty: true });
//1) GLOBAL MIDDLEWARES.

//static file middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//Morgan here logs the every url requests that browers requests
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limiting ip requests, preventing DOS, Bruteforce.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again after 1hr',
});
app.use('/api', limiter);

//Body parser, reading data from body to req.body.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization against NoSQL query.
app.use(mongoSanitize());

//Data Sanitization against XSS attacks.
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//middleware are gonna apply to every request if specified before respond obj
app.use((req, res, next) => {
  console.log('Hello from the middleware ');
  next();
});

app.use((req, res, next) => {
  //defing a property on request object to add the request time
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  // console.log(req.headers);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingsRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//Global error handling middleware.

app.use(globalErrorHandler);

module.exports = app;
