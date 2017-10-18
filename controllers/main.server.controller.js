// Libraries
const multer = require('multer');
const upload = multer({ dest: 'tempFiles' });
const fs = require('fs');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false });

//
let homeInfo = { lat: 25.320981, lng: 25.102705 };

const mainController = function () {


    const dataPesistanceMildware = (req, res, next) => {
        req.homeInfo = homeInfo;
        next();
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
            lat: req.homeInfo.lat,
            lng: req.homeInfo.lng
        });
    }

    const updateHomeData = [urlencodedParser, (req, res) => {
        const { lat, lng, geocodedAddress } = req.body;
        console.log(req.body);
        if (!req.body.lat) { res.json({ error: "Couldn't update home" }); return; }
        req.homeInfo = homeInfo = { lat, lng, geocodedAddress };
        res.render('homeLocation', {
            title: "Your Home",
            homeAddr: `Address successfuly set to: ${req.homeInfo.geocodedAddress}`,
            lat: req.homeInfo.lat,
            lng: req.homeInfo.lng
        });
    }]

    const trackUser = (req, res) => {
        console.log(req.homeInfo);
        res.render('location', {
            title: "Location",
            home: req.homeInfo,
            url: 'http://localhost:5000'
        });
    };

    return { dataPesistanceMildware, home, camImageStore, setHome, updateHomeData, trackUser }
}

module.exports = mainController();