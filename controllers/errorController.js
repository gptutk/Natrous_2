const AppError = require('../utils/appError');

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((ele) => ele.message);
  const message = `Ivalid Input Data . ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => new AppError('Invalid json web token', 401);
const customError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleJwtExpired = (err) =>
  new AppError('Token Expired, Login again', 401);

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //RENDERED WEBSITE
  console.log(err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //Operational, trusted error : send message to the client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programing or other unknown error: don't leak error details
    //1. Log Error
    console.error('UNOPERATIONAL ERROR🎃', err);

    //2 Send generic message
    return res.status(500).json({
      status: err.status,
      message: err.message,
    });
  }
  //RENDERED WEBSITE

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong !',
      msg: err.message,
    });
  }
  //Programing or other unknown error: don't leak error details

  //1. Log Error
  console.error('UNOPERATIONAL ERROR🎃', err);

  //2 Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong !',
    msg: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'err';
  console.log(process.env.NODE_ENV, '🎃');
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    console.log(err.name, '🤨');
    if (error.name === 'CastError') error = customError(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);

    if (error.name === 'TokenExpiredError') error = handleJwtExpired(error);
    sendErrorProd(error, req, res);
  }
};
// operational errors are the ones that we create to send as a response and hence can be used to send clients in the production phase.

//give a middleware handling func 4 arguments
//Express will identify it as error middleware

// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// };
