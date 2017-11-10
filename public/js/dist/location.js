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

function watchLocation(position) {
    var _position$coords = position.coords,
        latitude = _position$coords.latitude,
        longitude = _position$coords.longitude;

    app.distance = geolib.getDistance({ latitude: latitude, longitude: longitude }, homePostition);
    socket.emit('setLocation', { distance: app.distance, location: { latitude: latitude, longitude: longitude }, username: username });
}

function displayError(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}