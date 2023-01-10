const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

// module.exports = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'err';

//   if (process.env.NODE_ENV === 'development ') {
// sendErrorDev(req,res);
//   } else if (process.env.NODE_ENV === 'production') {
// sendErrorProd(req, res);
//   }
// };

//give a middleware handling func 4 arguments
//Express will identify it as error middleware

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
