const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/update-my-password', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// Only executes by admin
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
