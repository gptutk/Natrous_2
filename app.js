/* eslint-disable no-shadow */
const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

// const req = require('express/lib/request');
// const res = require('express/lib/response');
const { status, json, type } = require('express/lib/response');
const { contentDisposition } = require('express/lib/utils');
const res = require('express/lib/response');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRouters');
const globalErrorHandler = require('./controllers/errorController');

// const { application } = require('express');

const app = express();
// middleware
//use method is used to add middleware to the middleware stack
app.use(express.json());
//Morgan here logs the every url requests that browers requests

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//implementing user's resource

//static file middleware
app.use(express.static(`${__dirname}/public`));

//middleware are gonna apply to every request if specified before respond obj
//global middleware
app.use((req, res, next) => {
  console.log('Hello from the middleware ');

  next();
});

app.use((req, res, next) => {
  //defing a property on request object to add the request time
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//Global error handling middleware.

app.use(globalErrorHandler);

module.exports = app;
