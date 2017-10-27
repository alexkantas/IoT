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
});

let map;
let homeMarker;
let userMarker;

function startTracking() {
    if (!navigator.geolocation) return alert("Your device doesn't support geolocation!");
    const options = { enableHighAccuracy: true, maximumAge: 2000 };
    navigator.geolocation.watchPosition(watchLocation, displayError, options)
}

function watchLocation(position) {
    const { latitude, longitude } = position.coords;
    app.distance = geolib.getDistance({ latitude, longitude }, homePostition);
    userMarker.setPosition({ lat: latitude, lng: longitude })
    socket.emit('setLocation', { distance: app.distance, location: { latitude, longitude }, username });
}

function displayError(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}

function initMap() {
    let position = { lat: homePostition.latitude, lng: homePostition.longitude };
    let homeIcon = '/public/img/house-icon.png';

    map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 14
    });

    homeMarker = new google.maps.Marker({
        position,
        map,
        icon: homeIcon
    });

    userMarker = new google.maps.Marker({
        map,
        title: 'Your position'
    });

    console.log('Map i showing!!');
}