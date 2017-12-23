// Server URL
const url = 'https://thesis.kantas.net';
// const url = 'http://192.168.1.66:5000';
// Auth Data
const auth = {
    'user': 'alex',
    'pass': 'alexinio22'
}
// Socket IO
const socket = require('socket.io-client')(url);
// Request
const request = require('request');
const fs = require('fs');
// WebCam
const NodeWebcam = require("node-webcam");
const Webcam = NodeWebcam.create({ width: 256, height: 256, output: "jpeg", callbackReturn: 'base64' });
// Raspicam
const RaspiCam = require("raspicam");
const raspiCamOptinos = {
    mode: 'timelapse',
    timeout: 120000,
    timelapse: 1000,
    output: __dirname + '/photo.jpg',
    vf: true,
    w: 600,
    h: 400
}
const camera = new RaspiCam(raspiCamOptinos);
const raspiCamStaticOptios = { mode: 'photo', output: __dirname + '/cam.jpg', vf: true, w: 720, h: 480 }
const scamera = new RaspiCam(raspiCamStaticOptios);
// Gpio
const gpio = require('rpi-gpio');
// Temperature - Ηumidity Sensor
const sensor = require('node-dht-sensor');
//Base64 Img
const base64Img = require('base64-img');

// Application variables
const sensorPin = 17;
const password = 'superSecretCode';
const devices = [
    {
        deviceId: 1,
        pin: 13,
        isEnabled: true,
        color: 'red'
    },
    {
        deviceId: 2,
        pin: 12,
        isEnabled: true,
        color: 'green'
    }
]

//Set up pins for write
devices.forEach(device => {
    gpio.setup(device.pin, gpio.DIR_OUT, () => gpio.write(device.pin, device.isEnabled));
});

const cameras = [
    {
        camId: 1,
        captureActive: false,
        name: 'camera'
    },
    {
        camId: 2,
        captureActive: false,
        name: 'webcamera'
    },
]

console.log('Raspberry running ...');

//Sent Data
socket.emit('welcomeRaspberry', { password });


//Listening
socket.on('setDeviceStatus', data => {
    const devIndex = devices.findIndex(d => data.deviceId == d.deviceId);
    if (devIndex === -1) { return socket.emit('errorMessage', { error: 'noDeviceFound' }) };
    if (!data.justReport) devices[devIndex].isEnabled = data.isEnabled;
    const { deviceId, pin, isEnabled } = devices[devIndex];
    gpio.write(pin, isEnabled, error => {
        if (error) { socket.emit('errorMessage', { error }); return; };
        socket.emit('deviceStatus', { password, deviceId, isEnabled });
    })
});

socket.on('updateImage', data => {
    const camIndex = cameras.findIndex(c => data.camId == c.camId);
    if (camIndex === -1) return;
    if (cameras[camIndex].name === 'camera') { raspCamShot(cameras[camIndex].camId, cameras[camIndex].name); return };
    if (cameras[camIndex].name === 'webcamera') { webCamShotStatic(cameras[camIndex].camId, cameras[camIndex].name); return };
});

// Sent Updated Weather Data
let weatherIvl = setInterval(updateWeatherData, 2500);
socket.on('weatherData', data => {
    clearInterval(weatherIvl);
    weatherIvl = setInterval(updateWeatherData, 1500);
    setTimeout(() => { clearInterval(weatherIvl) }, 30000)
})

// Enable RaspiCam
camera.on("read", function (err, dateStamp, file) {
    base64Img.base64(file, function (err, image) {
        socket.emit('imageStream', { camId: 1, dateStamp, image });
    });
});

// Functions
function updateWeatherData() {
    sensor.read(22, sensorPin, function (error, temperature, humidity) {
        if (error) { socket.emit('errorMessage', { error }); return; };
        socket.emit('setWeatherData', { password, temperature: temperature.toFixed(1), humidity: humidity.toFixed(1) });
    });
}

function webCamShot() {
    console.log('video', 3.52);
    Webcam.capture("picture", (err, image) => {
        if (err) { return err; }
        socket.emit('imageStream', { camId: 2, dateStamp: Date.now(), image });
        if (cameras[1].captureActive) setTimeout(webCamShot, 550);
    });
}

socket.on('startCapture', data => {
    if (cameras[1].camId == data.camId) startWebCam()
    else if (cameras[0].camId == data.camId) startCam();
});

socket.on('getCaptureStatus', data => {
    const i = cameras.findIndex(c => c.camId == data.camId);
    socket.emit('captrureStatus', { camId: data.camId, captureStatus: cameras[i].captureActive });
});

function startWebCam() {
    console.log('video', 3.2);
    if (cameras[1].captureActive) return;
    cameras[1].captureActive = true;
    webCamShot();
    setTimeout(() => {
        cameras[1].captureActive = false;
        socket.emit('captrureStatus', { camId: 2, captureStatus: false })
    }, 60000);
}

function startCam() {
    if (cameras[0].captureActive) return;
    cameras[0].captureActive = true;
    camera.start();
    setTimeout(() => {
        camera.stop();
        cameras[0].captureActive = false;
        socket.emit('captrureStatus', { camId: 1, captureStatus: false })
    }, 60000);
}


// Enable static RaspiCam
scamera.on("read", sentCamData);

//Static Img functions
function webCamShotStatic(camId, camName) {
    Webcam.capture("webcam", (error, data) => {
        if (error) { socket.emit('errorMessage', { error }); return }
        const formData = { camimage: fs.createReadStream(__dirname + '/webcam.jpg'), dateStamp: Date.now(), camId, camName };
        request.post({ url: `${url}/upLoadImage/camera`, formData, auth }, (error, httpRes, body) => {
            if (error) {
                socket.emit('errorMessage', { error });
                console.error('upload failed:', error);
                return;
            }
            console.log('Upload successful!  Server responded with:', body);
        });
    });
}

function raspCamShot(camId, camName) {
    sentCamData.camId = camId;
    sentCamData.camName = camName;
    scamera.start();
}

function sentCamData(error, dateStamp, filename) {
    if (error) { socket.emit('errorMessage', { error }); return }
    const { camId, camName } = sentCamData;
    const formData = { camimage: fs.createReadStream(__dirname + '/cam.jpg'), dateStamp, camId, camName };
    request.post({ url: `${url}/upLoadImage/camera`, formData, auth }, (error, httpRes, body) => {
        if (error) {
            socket.emit('errorMessage', { error });
            console.error('upload failed:', error);
            return;
        }
        console.log('Upload successful!  Server responded with:', body);
    });
}