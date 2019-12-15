const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;
const User = require("../../models/user.model.js");
const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/thesis';
// const mongoConnect = mongoose.connect(mongoUrl, { useMongoClient: true });
mongoose.Promise = global.Promise;

const usernameList = ['ALEX', 'LEFTERIS', 'GEORGE', 'MARIA', 'ANNA']

const userStategy = function () {
    passport.use(
        new LocalStategy({ usernameField: 'username', passwordField: 'password' },
            (username, password, done) => {
                if (usernameList.includes(username)) return done(null, { username });
                done(null, {username: 'GUEST'})
            }));
}

module.exports = userStategy;