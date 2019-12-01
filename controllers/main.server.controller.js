// Libraries
const multer = require('multer');
const upload = multer({ dest: 'tempFiles' });
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require('passport');
const User = require("../models/user.model.js");

//
let homeInfo = { lat: 35.32098178540996, lng: 25.10274052619934 };
const url = 'https://thesis.kantas.net';

const mainController = function () {


    const dataPesistanceMildware = (req, res, next) => {
        req.homeInfo = homeInfo;
        next();
    }

    const login = (req, res) => {
        if (req.user) return res.redirect('/dashboard');
        res.render('login', {
            title: 'Home Monitoring - LogIn',
            wrongInfo: false
        })
    }

    const loginForm = (req, res) => {
        res.render('login', {
            title: 'Home Monitoring - LogIn',
            wrongInfo: false
        })
    }

    const links = (req, res) => {
        res.render('links', {
            title: 'Home Monitoring - links'
        })
    }

    const documentation = (req, res) => {
        res.redirect('/public/documentation/kantasThesis.pdf')
    }

    const authenticate = [
        urlencodedParser,
        (req, res, next) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) { console.log(err); return }
                if (!user) { res.render('login', { title: 'Home Monitoring - LogIn', wrongInfo: true }); return; }
                req.logIn(user, err => {
                    if (err) { console.log(err); return }
                    return res.redirect('/dashboard');
                });
            })(req, res, next);
        }]

    const logout = (req, res) => {
        req.logout();
        res.redirect('/');
    }

    const registerForm = (req, res) => {
        res.render('register', {
            title: 'Home Monitoring - Register',
            wrongInfo: false
        })
    }

    const register = [
        urlencodedParser,
        (req, res) => {
            const { username, password } = req.body;
            const user = new User({
                username,
                password
            });
            user.save()
                .then(r => {
                    res.send('You are registered successfully! <a href="/">You can log-in now!</a>');
                })
                .catch(err => {
                    res.end('Error during registration' + err);
                })
        }];

    const authMildware = (req, res, next) => {
        if (req.user) {
            next();
            return;
        } else {
            req.user = {
                "username": "GUEST",
                "password": "GUEST",
            }
        }
        next();
    }

    const home = (req, res) => {
        res.render('index', {
            title: 'Home Monitoring',
            username: req.user.username,
            url
        })
    }

    const homeSimple = (req, res) => {
        res.render('indexSimple', {
            title: 'Home Monitoring',
            username: req.user.username,
            url
        })
    }

    const camImageStore = [
        upload.single('camimage'),
        (req, res) => {
            console.log('Image 4', req.body);
            if (!req.file) {
                res.status(500).json({ error: 'noFile' });
                req.io.emit('errorMessage', { error });
                return;
            }
            fs.rename(req.file.path, `public/img/${req.body.camName}.jpg`, (error) => {
                if (error) {
                    req.io.emit('errorMessage', { error });
                    console.log(error);
                    return;
                }
                req.io.emit('newImage', { dateStamp: req.body.dateStamp, camId: req.body.camId });
                res.json(req.file);
            })
        }];

    const setHome = (req, res) => {
        res.render('homeLocation', {
            title: "Your Home",
            homeAddr: `Please select your Home`,
            lat: homeInfo.lat,
            lng: homeInfo.lng
        });
    }

    const updateHomeData = [jsonParser, (req, res) => {
        const { lat, lng, geocodedAddress } = req.body;
        console.log(req.body);
        if (!req.body.lat) { res.json({ error: "Couldn't update home" }); return; }
        homeInfo = { lat, lng, geocodedAddress };
        res.json({
            homeAddr: `Address successfuly set to: ${homeInfo.geocodedAddress}`,
            lat: homeInfo.lat,
            lng: homeInfo.lng
        });
    }]

    const trackUser = (req, res) => {
        console.log(homeInfo);
        res.render('location', {
            title: "Location",
            home: homeInfo,
            username: req.user.username,
            url
        });
    };

    const trackUserMap = (req, res) => {
        console.log(homeInfo);
        res.render('locationMap', {
            title: "Location",
            home: homeInfo,
            username: req.user.username,
            url
        });
    };

    const trackUserSim = (req, res) => {
        console.log(homeInfo);
        res.render('locationMapSim', {
            title: "Location",
            home: homeInfo,
            username: req.user.username,
            url
        });
    };

    const canvas = (req, res) => {
        res.render('canvas', {
            url
        });
    };

    return { documentation, register, links, registerForm, homeSimple, logout, trackUserSim, loginForm, trackUserMap, login, authMildware, authenticate, dataPesistanceMildware, home, camImageStore, setHome, updateHomeData, trackUser, canvas }
}

module.exports = mainController();