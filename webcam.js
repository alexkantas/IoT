var NodeWebcam = require("node-webcam");

var Webcam = NodeWebcam.create();

Webcam.capture("test_picture", function (err, data) {
    if (!err) console.log("WebCam Image created!");
});