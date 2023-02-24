/* eslint-disable */

// const { default: axios } = require('axios');
// import axios from 'axios';

// import { showAlert } from './alert';

// ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutTrig = document.querySelector('.nav__el--logout');

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
const showAlert = (type, msg) => {
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 5000);
};
//LOGOUT
const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Error Logging out! Please try again');
  }
};

if (logOutTrig) {
  logOutTrig.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

//LOGIN
export const login = async (email, password) => {
  try {
    console.log({ email }, { password });
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      withCredentials: true,
      data: {
        email,
        password,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in Successfully !');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err.response.data.message, '👻');
    showAlert('error', err.response.data.message);
    // console.log(err.response.data);
  }
};

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    //   console.log(email, password);
    login(email, password);
  });
