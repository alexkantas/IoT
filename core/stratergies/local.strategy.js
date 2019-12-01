const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;
const User = require("../../models/user.model.js");
const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/thesis';
const mongoConnect = mongoose.connect(mongoUrl, { useMongoClient: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;


const userStategy = function () {
    passport.use(
        new LocalStategy({ usernameField: 'username', passwordField: 'password' },
            (username, password, done) => {
                console.log('Mesa sth strategi!!');
                User.findOne({ username, password })
                    .then(user => {
                        console.log('Brhkame ton user!!');
                        if (user) {
                            done(null, user);
                            return;
                        }
                        done(null, false, { message: 'Wrong creadantials' });
                    })
                    .catch(err => {
                        console.log('Error' + err)
                        done(null, {
                            "username": "GUEST".concat(Date.now()),
                            "password": "GUEST",
                        });
                    });
            }
        ));
}

module.exports = userStategy;