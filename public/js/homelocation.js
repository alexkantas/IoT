let map;
let marker;
let geocoder;

const app = new Vue({
    el: '#app',
    data: {
        distance: 0,
        homeAddr,
        lat,
        lng,
        isModalActive: false,
        isModalLoading: false,
    },
    mounted() {

    },
    methods: {
        showModal(visibility) {
            this.isModalActive = visibility;
        },
        updateHome() {
            this.isModalLoading = true;

            fetch('/setHome', {
                method: 'post',
                body: JSON.stringify({
                    lat: this.lat,
                    lng: this.lng,
                    geocodedAddress: this.homeAddr
                }),
                headers: {
                    "Content-Type": "application/json"
                  }
            }).then(r => r.json()).then(r => {
                this.homeAddr = `Home updated Successfully to "${r.geocodedAddress}" !`;
                this.isModalActive = false;
                this.isModalLoading = false;
                console.log(r);
            }).catch(r => {
                this.homeAddr = "Couldn't update home";
                this.isModalActive = false;
                this.isModalLoading = false;
                console.log(r);
            });
        }
    }
})

function initMap() {
    geocoder = new google.maps.Geocoder;
    let position = { lat, lng };
    map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 14
    });

    marker = new google.maps.Marker({
        position,
        map
    });

    map.addListener('click', function (e) {
        placeMarkerAndPanTo(e.latLng, map);
    });

    console.log('Map i showing!!');
}

function placeMarkerAndPanTo(location, map) {
    marker.setPosition(location);
    map.panTo(location);
    geocoder.geocode({ location }, (results, status) => {
        if (status != 'OK') { console.log("Error: " + status); return }
        if (!results[0]) { console.log("No results"); return }
        app.homeAddr = results[0].formatted_address;
        app.lat = location.lat();
        app.lng = location.lng();
    });
}