const app = new Vue({
    el: '#app',
    data: {
        distance: 0
    },
    mounted() {
        const noSleep = new NoSleep();
        noSleep.enable();
        startTracking();
    }
})

function startTracking() {
    if (!navigator.geolocation) return alert("Your device doesn't support geolocation!");
    const options = { enableHighAccuracy: true, maximumAge: 2000 };
    navigator.geolocation.watchPosition(watchLocation, displayError, options)
}

function watchLocation(position) {
    const { latitude, longitude } = position.coords;
    app.distance = geolib.getDistance({ latitude, longitude }, homePostition);
    socket.emit('setLocation', {distance:app.distance,location:{latitude, longitude },username});
}

function displayError(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}