class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    //to preserve stack trace we do this
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// operational errors are the ones that we create to send as a response and hence can be used to send clients in the production phase.
