"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = void 0;

/* eslint-disable */
// const { default: axios } = require('axios');
// import axios from 'axios';
// import { showAlert } from './alert';
// ELEMENTS
var loginForm = document.querySelector('.form--login');
var logOutTrig = document.querySelector('.nav__el--logout');

var hideAlert = function hideAlert() {
  var el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

var showAlert = function showAlert(type, msg) {
  var markup = "<div class =\"alert alert--".concat(type, "\">").concat(msg, "</div>");
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
}; //LOGOUT


var logout = function logout() {
  var res;
  return regeneratorRuntime.async(function logout$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout'
          }));

        case 3:
          res = _context.sent;
          if (res.data.status === 'success') location.reload(true);
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          showAlert('error', 'Error Logging out! Please try again');

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

if (logOutTrig) {
  logOutTrig.addEventListener('click', function (e) {
    e.preventDefault();
    logout();
  });
} //LOGIN


var login = function login(email, password) {
  var res;
  return regeneratorRuntime.async(function login$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            withCredentials: true,
            data: {
              email: email,
              password: password
            }
          }));

        case 3:
          res = _context2.sent;

          if (res.data.status === 'success') {
            showAlert('success', 'Logged in Successfully !');
            window.setTimeout(function () {
              location.assign('/');
            }, 1500);
          }

          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          showAlert('error', _context2.t0.response.data.message); // console.log(err.response.data);

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

exports.login = login;
if (loginForm) loginForm.addEventListener('submit', function (e) {
  e.preventDefault();
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value; //   console.log(email, password);

  login(email, password);
});