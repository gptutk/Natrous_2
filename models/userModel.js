const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please specify your name !'],
  },
  email: {
    type: String,
    required: [true, 'please mention your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['admin', 'guide', 'lead-guide', 'user'],
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //This only works  on SAVE!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
});

//pre middleware on save
//bcrypt algo

userSchema.pre('save', async function (next) {
  //only run if password was modified
  if (!this.isModified('password')) return next();

  //pass in a cost parameter. cpu intensivity
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (inputPass, userPass) {
  return await bcrypt.compare(inputPass, userPass);
};

userSchema.method.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //we send just reset token not the encryptedone otherwise the encryption will be useless in saving it to the database
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
