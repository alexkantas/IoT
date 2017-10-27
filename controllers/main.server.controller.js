// Libraries
const multer = require('multer');
const upload = multer({ dest: 'tempFiles' });
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require('passport');

//
let homeInfo = { lat: 35.32098178540996, lng: 25.10274052619934 };

const mainController = function () {


    const dataPesistanceMildware = (req, res, next) => {
        req.homeInfo = homeInfo;
        next();
    }

    const login = (req, res) => {
        if (req.user) return res.redirect('/welcome');
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

    const authenticate = [
        urlencodedParser,
        (req, res, next) => {
            passport.authenticate('local', (err, user, info) => {
                if (err) { console.log(err); return }
                if (!user) { res.render('login', { title: 'Home Monitoring - LogIn', wrongInfo: true }); return; }
                req.logIn(user, err => {
                    if (err) { console.log(err); return }
                    return res.redirect('/welcome');
                });
            })(req, res, next);
        }]

    const logout = (req, res) => {
        req.logout();
        res.redirect('/');
    }

    const authMildware = (req, res, next) => {
        if (req.user) {
            next();
            return;
        }
        return res.redirect('/');
    }

    const home = (req, res) => {
        res.render('index', {
            title: 'Home Monitoring',
            url: 'localhost:5000'
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
            url: 'http://localhost:5000'
        });
    };

    const trackUserMap = (req, res) => {
        console.log(homeInfo);
        res.render('locationMap', {
            title: "Location",
            home: homeInfo,
            username: req.user.username,
            url: 'http://localhost:5000'
        });
    };

    const trackUserSim = (req, res) => {
        console.log(homeInfo);
        res.render('locationMapSim', {
            title: "Location",
            home: homeInfo,
            username: req.user.username,
            url: 'http://localhost:5000'
        });
    };

    const canvas = (req, res) => {
        res.render('canvas', {
            url: 'http://localhost:5000'
        });
    };

    return { trackUserSim, loginForm, trackUserMap, login, authMildware, authenticate, dataPesistanceMildware, home, camImageStore, setHome, updateHomeData, trackUser, canvas }
}

module.exports = mainController();