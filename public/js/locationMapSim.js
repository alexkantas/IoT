let map;
let homeMarker;
let userMarker;
let { latitude, longitude } = homePostition;

const app = new Vue({
    el: '#app',
    data: {
        distance: 1000
    },
    mounted() {
    },
    methods: {
        setDistance(meters) {
            if (this.distance + meters < 0) {this.distance = 0; return}
            this.distance += meters;
            socket.emit('setLocation', { distance: this.distance, location: { latitude, longitude }, username });
        },
        resetDistance() {
            this.distance = 1000;
            socket.emit('setLocation', { distance: this.distance, location: { latitude, longitude }, username });
        }
    }
});

function updatetLocation() {
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
        title: 'Home',
        icon: homeIcon
    });

    userMarker = new google.maps.Marker({
        map,
        position,
        title: 'Your position'
    });

    map.addListener('click', e => {
        userMarker.setPosition(e.latLng);
        map.panTo(e.latLng);
        latitude = e.latLng.lat();
        longitude = e.latLng.lng();
        console.log({latitude,longitude});
        updatetLocation()
    });

    console.log('Map is showing!!');
}