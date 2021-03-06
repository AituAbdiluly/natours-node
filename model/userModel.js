const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const Review = require('./reviewModel');
const Booking = require('./bookingModel');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    // trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    // trim: true,
    minlength: [8, "A user's password must have at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on SAVE and CREATE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: false,
    select: false,
  },
  emailValidationToken: String,
  emailValidationExpires: Date
});

// userSchema.pre(/^find/, function (next) {
//   // This points to the current query
//   this.find({ active: { $ne: false } });

//   next();
// });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // add 10 min => 600000 miliseconds

  return resetToken;
};

userSchema.methods.createEmailValidationToken = function () {
  const validationToken = crypto.randomBytes(32).toString('hex');

  this.emailValidationToken = crypto
    .createHash('sha256')
    .update(validationToken)
    .digest('hex');

  this.emailValidationExpires = Date.now() + 1600417654; // add 1 week

  return validationToken;
};

userSchema.pre('remove', async function (next) {
  try {
    // Delete reviews related to current user
    await Review.remove({
      user: { $in: this._id },
    });
    // Delete bookings related to current user
    await Booking.remove({
      user: { $in: this._id },
    });
    next();
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
