'use strict';

var app = new Vue({
    el: '#app',
    data: {
        distance: 0
    },
    mounted: function mounted() {
        var noSleep = new NoSleep();
        noSleep.enable();
        startTracking();
    }
});

function startTracking() {
    if (!navigator.geolocation) return alert("Your device doesn't support geolocation!");
    var options = { enableHighAccuracy: true, maximumAge: 2000 };
    navigator.geolocation.watchPosition(watchLocation, displayError, options);
}
var show = 4;
function watchLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    app.distance = geolib.getDistance({ latitude: latitude, longitude: longitude }, homePostition);
    shows(app.distance);
    socket.emit('setLocation', app.distance);
}

function displayError(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}

function shows(d){
    console.log(show,d);
    if(show >5 || show < 0) show = 0;
    if(show == 4 || show == 1)
    alert(d);
    show++;
}