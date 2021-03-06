/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { register } from './register';
import { sendReview, deleteReview } from './review';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { confirmEmail } from './confirmEmail';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const registerForm = document.querySelector('.form--register');
const reviewForm = document.querySelector('.form--review');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const confirmationEmail = document.querySelector('.confirm-email');
const bookBtn = document.getElementById('book-tour');
const removeReviewBtn = document.querySelectorAll('#remove-review');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector('.btn--register').textContent = 'Loading...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    register(name, email, password, passwordConfirm);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;

    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 10);

if (reviewForm) {
  const { tourId } = reviewForm.dataset;
  const review = document.getElementById('review');
  const radios = document.getElementsByName('rating');
  let rating;

  for (let i = 0, length = radios.length; i < length; i++) {
    radios[i].addEventListener('click', function () {
      rating = this.value;
    });
  }
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await sendReview(tourId, review.value, +rating);
  });
}

if (removeReviewBtn) {
  removeReviewBtn.forEach((button) => {
    const { reviewId } = button.dataset;

    button.addEventListener('click', async function () {
      await deleteReview(reviewId);
    });
  });
}

if (confirmationEmail) {
  const { emailToken } = confirmationEmail.dataset;
  window.addEventListener('load', async function () {
    await confirmEmail(emailToken);
  });
}
