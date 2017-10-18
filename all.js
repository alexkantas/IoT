var gpio = require('rpi-gpio');
var sensor = require('node-dht-sensor');
const request = require('request');
const fs = require('fs');

let pin = 13;
let tempPin = 17;
let pinR = 12;

var repeat = 0;

var NodeWebcam = require("node-webcam");

var opts = { delay: 1 };

var Webcam = NodeWebcam.create(opts);

var RaspiCam = require("raspicam");

var opts = {
    mode: 'photo',
    output: __dirname + '/photo.jpg',
    vf: true
}

const camera = new RaspiCam(opts);

gpio.setup(pin, gpio.DIR_OUT, write);
gpio.setup(pinR, gpio.DIR_OUT);

camera.on("read", function (err, timestamp, filename) {
    console.log('Camera file saved!!!');
});

function write(status) {
    return gpio.write(pin, status, function (err) {
        if (err) throw err;
        console.log(`------${++repeat}-------`);
        var msg = status ? 'on' : 'off';
        console.log(`Green light is now ${msg}!!!`);
        gpio.write(pinR, !status, err => { if (err) throw err; console.log(`Red light is now ${!status ? 'on' : 'off'}!!!`); })
        blink(!status)
    });
}

var go = () => {
    sensor.read(22, tempPin, function (err, temperature, humidity) {
        if (err) { console.log(err); return }
        console.log('Θερμοκρασία: ' + temperature.toFixed(1) + '°C, ' +
            'Υγρασία: ' + humidity.toFixed(1) + '%'
        );

    })
};

var goWeb = () => {
    Webcam.capture("test_picture", function (err, data) {
        if (!err) console.log("WebCam Image created!");
    });
}

const goUpload = () => {
    var formData = {
        camimage: fs.createReadStream(__dirname + '/photo.jpg')
    };

    request.post({ url: 'http://192.168.1.66:5000/image', formData }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
}

const goUpload2 = () => {
    var formData = {
        camimage: fs.createReadStream(__dirname + '/test_picture.jpg')
    };

    request.post({ url: 'http://192.168.1.66:5000/image', formData }, function optionalCallback(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
}

function blink(status = true) {
    setTimeout(() => {
        go();
        goWeb();
        camera.start();
        goUpload();
        goUpload2();
        write(status);
    }, 15000);
}