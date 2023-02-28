"use strict";

module.exports = function (fn) {
  return function (req, res, next) {
    fn(req, res, next)["catch"](function (err) {
      console.log(err.message);
      next(err);
    });
  };
};