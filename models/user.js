/* ********************  (Authentication & Authorization ) *************************

Authentication is the process of verifying the identity of a user. & Authorization is the process of checking what a user is allowed to do after authentication. */

/* ************** ( Using passport, passport-local, passport-local-mongoose ) : ************

1. Passport :  is a flexible and modular authentication middleware.
2. passport-local : passport-local is a strategy for Passport.js used to authenticate users using a username and password.
3. passport-local-mongoose :  is a Mongoose plugin that simplifies user authentication using passport-local with zero boilerplate. */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose); // it will automatically implement username, hashing,salting and hashedPassword.

module.exports = mongoose.model("User", userSchema);
