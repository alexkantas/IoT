const passport = require('passport');

const passCng = function (app) {

    app.use(passport.initialize());
    app.use(passport.session());
    passport.serializeUser((user, done) => { done(null, user) });
    passport.deserializeUser((user, done) => { done(null, user) });
 
    require('./stratergies/local.strategy.js')();
}

module.exports = passCng;