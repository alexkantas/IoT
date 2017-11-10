'use strict';

var map = void 0;
var homeMarker = void 0;
var userMarker = void 0;
window.Event = new Vue();

Vue.component('mapmodal', {
    data: function data() {
        return {
            homelocation: {},
            userlocation: {}
        };
    },
    mounted: function mounted() {
        initMap();
        Event.$on('reloadMap', function (data) {
            setTimeout(function () {
                google.maps.event.trigger(map, 'resize');
                if (data && data.location) map.panTo(data.location);
            }, 100);
        });
    },

    template: '<div class="modal is-active">\n    <div class="modal-background" @click="$emit(\'close\')"></div>\n    <div class="modal-content">\n    <div class="modalMap notification is-info">\n    <section id="map" class="map">Loading map...</section>\n    </div></div>\n    <button class="modal-close is-large" aria-label="close" @click="$emit(\'close\')"></button>\n    </div>'
});

Vue.component('userbox', {
    props: ['username', 'index', 'distance'],
    data: function data() {
        return {
            userDistance: 1000
        };
    },

    computed: {
        isUserNearby: function isUserNearby() {
            var distanceLimit = 100;
            return this.userDistance > 0 && this.userDistance < distanceLimit;
        }
    },
    mounted: function mounted() {
        var _this = this;

        this.userDistance = this.distance;
        socket.on('userLocation', function (data) {
            if (data.username != _this.username) return;
            var distanceLimit = 100;
            var userJustArrived = data.distance < distanceLimit && !(_this.userDistance > 0 && _this.userDistance < distanceLimit) && data.distance < _this.userDistance; // True if user not home, new distance less than distanceLimit and smaller tha previous
            if (userJustArrived) {
                var title = _this.username + ' just arrived at home!';
                iziToast.success({
                    title: title,
                    timeout: 10000
                });
                new Notification(title);
            }
            _this.userDistance = data.distance;
            console.log(data.location);
            window.Event.$emit('updateMarker', { username: _this.username, index: _this.index, position: { lat: data.location.latitude, lng: data.location.longitude } });
        });
    },

    template: '<div class="column is-narrow">\n    <div :class="{\'is-danger\':!isUserNearby,\'is-success\':isUserNearby}" class="notification">\n    <span class="icon littleMargin">\n    <i class="fa  fa-map-marker fa-2x"></i>\n    </span>\n    {{username}} is <strong>{{userDistance}}</strong> meters away from home!\n    </div></div>'
});

Vue.component('usersarea', {
    data: function data() {
        return {
            users: [],
            mapModal: false
        };
    },

    methods: {
        showMap: function showMap(username, i) {
            this.mapModal = true;
            this.currentUser = username;
            userMarker.setPosition(this.users[i].position);
            Event.$emit('reloadMap', { location: this.users[i].position });
        },
        hideModal: function hideModal() {
            this.mapModal = false;
        }
    },
    mounted: function mounted() {
        var _this2 = this;

        Event.$on('updateMarker', function (data) {
            _this2.users[data.index].position = data.position;
            if (_this2.currentUser === data.username) {
                userMarker.setPosition(data.position);
                map.panTo(data.position);
            }
            Event.$emit('reloadMap');
        });
        socket.on('userLocation', function (data) {
            console.log('Dater are ' + _this2.users.findIndex(function (u) {
                return u.username === data.username;
            }));
            if (_this2.users.findIndex(function (u) {
                return u.username === data.username;
            }) === -1) {
                _this2.users.push({ username: data.username, distance: data.distance, position: { lat: data.location.latitude, lng: data.location.longitude } });
            }
        });
    },

    template: '<div>\n    <mapmodal v-show="mapModal" @close="hideModal"></mapmodal>\n    <section class="columns usersArea">\n        <template  v-for="(user,index) of users">\n            <userbox :username="user.username" :index="index" :distance="user.distance" @click.native="showMap(user.username,index)"></userbox>\n        </template>\n    </section>\n    </div>'
});

Vue.component('device', {
    props: {
        deviceId: { type: Number, required: true },
        iconClass: String,
        meters: { type: Number, default: 0 },
        temp: { type: Number, default: 0 },
        enabled: { type: Boolean, default: false }
    },
    data: function data() {
        return {
            isDeviceEnabled: this.enabled,
            isLoading: false
        };
    },

    computed: {
        statusText: function statusText() {
            return this.isDeviceEnabled ? 'Συσκευή Ενεργή' : 'Συσκευή Ανενεργή';
        },
        buttonText: function buttonText() {
            return this.isDeviceEnabled ? 'Απενεργοποίηση' : 'Άμεση Ενεργοποίηση';
        },
        statusClass: function statusClass() {
            return this.isDeviceEnabled ? 'has-text-success' : 'has-text-danger';
        }
    },
    methods: {
        changeDeviceStatus: function changeDeviceStatus() {
            this.isLoading = true;
            socket.emit('setDeviceStatus', { deviceId: this.deviceId, isEnabled: !this.isDeviceEnabled });
        }
    },
    created: function created() {
        console.log('1');
        socket.emit('setDeviceStatus', { deviceId: this.deviceId, justReport: true });
    },
    mounted: function mounted() {
        var _this3 = this;

        socket.on('deviceStatus', function (data) {
            console.log('5', data);
            if (data.deviceId == _this3.deviceId) {
                _this3.isDeviceEnabled = data.isEnabled;
                _this3.isLoading = false;
            }
        });
    },

    template: '<div class="tile is-child box notification is-warning">\n    <p class="title"><slot></slot></p>\n    <div class="columns">\n        <div class="column centeredElements">\n            <span class="icon">\n            <i class="fa fa-5x" :class="iconClass"></i>\n            </span>\n            <p class="title has-text-centered" :class="statusClass">{{statusText}}</p>\n        </div>\n        <div class="column">\n            <p>\u0397 \u03C3\u03C5\u03C3\u03BA\u03B5\u03C5\u03AE \u03B5\u03BD\u03B5\u03C1\u03B3\u03BF\u03C0\u03BF\u03B9\u03AE\u03C4\u03B5 \u03B1\u03C5\u03C4\u03CC\u03BC\u03B1\u03C4\u03B1 \u03CC\u03C4\u03B1\u03BD:</p>\n            <p v-if="meters > 0">O \u03C7\u03C1\u03AE\u03C3\u03C4\u03B7\u03C2 \u03B5\u03AF\u03BD\u03B1\u03B9 <strong>{{meters}}</strong> \u03BC\u03AD\u03C4\u03C1\u03B1 \u03BC\u03B1\u03BA\u03C1\u03B9\u03AC \u03B1\u03C0\u03CC \u03C4\u03BF \u03C3\u03C0\u03AF\u03C4\u03B9.</p>\n            <p v-if="temp > 0">\u0397 \u03B8\u03B5\u03C1\u03BC\u03BF\u03BA\u03C1\u03B1\u03C3\u03AF\u03B1 \u03BA\u03AC\u03C4\u03C9 \u03B1\u03C0\u03CC <strong>{{temp}}</strong> \u03B2\u03B1\u03B8\u03BC\u03BF\u03CD\u03C2 \u03BA\u03B5\u03BB\u03C3\u03AF\u03BF\u03C5</p>\n            <p class="topMargin"><button class="button is-large is-success is-outlined is-inverted" :class="{\'is-loading\':isLoading}" @click="changeDeviceStatus">{{buttonText}}</button></p>\n        </div>\n    </div>\n</div>'
});

Vue.component('image-area', {
    props: ['cssClasses', 'imageUrl', 'camId'],
    data: function data() {
        return {
            dateStamp: 0,
            isLoading: false
        };
    },

    template: '<div class="tile is-child box notification is-info">\n    <p class="title">\u0395\u03B9\u03BA\u03CC\u03BD\u03B1</p>\n    <p><slot></slot><strong>{{imageDate}}</strong></p>\n    <figure :class="cssObj">\n        <img :src="getImageURL">\n    </figure>\n    <p class="topMargin has-text-centered"><button class="button is-large is-warning is-outlined is-inverted" :class="{\'is-loading\':isLoading}" @click="updateImage">\u0391\u03BD\u03B1\u03BD\u03AD\u03C9\u03C3\u03B7 \u03B5\u03B9\u03BA\u03CC\u03BD\u03B1\u03C2</button></p>\n</div>',
    mounted: function mounted() {
        var _this4 = this;

        console.log(this.cssClasses, this.imageUrl, this.camId);
        socket.on('newImage', function (data) {
            console.log('Image 5', data);
            if (data.camId == _this4.camId) {
                _this4.dateStamp = parseInt(data.dateStamp);
                _this4.isLoading = false;
            }
        });
    },

    methods: {
        updateImage: function updateImage() {
            console.log('Image 1');
            this.isLoading = true;
            socket.emit('updateImage', { camId: this.camId });
        }
    },
    computed: {
        cssObj: function cssObj() {
            return this.cssClasses.split(' ').reduce(function (obj, val) {
                return obj[val] = true, obj;
            }, {});
        },
        getImageURL: function getImageURL() {
            return this.imageUrl + '?d=' + this.dateStamp;
        },
        imageDate: function imageDate() {
            return moment(this.dateStamp).calendar();
        }
    }
});

Vue.component('video-area', {
    props: ['cssClasses', 'imageUrl', 'camId'],
    data: function data() {
        return {
            dateStamp: 0,
            activeCapture: false,
            image: ''
        };
    },

    template: '<div class="tile is-child box notification is-info">\n    <p class="title">\u0395\u03B9\u03BA\u03CC\u03BD\u03B1</p>\n    <p><slot></slot><strong>{{imageDate}}</strong></p>\n    <figure :class="cssObj">\n        <img :src="image">\n    </figure>\n    <p class="topMargin has-text-centered"><button class="button is-large is-warning is-outlined is-inverted" @click="startCapture" :disabled="activeCapture">{{buttonText}}</button></p>\n</div>',
    mounted: function mounted() {
        var _this5 = this;

        this.image = this.imageUrl;
        console.log(this.cssClasses, this.imageUrl, this.camId);
        socket.emit('getCaptureStatus', { camId: this.camId });
        socket.on('imageStream', function (data) {
            console.log('video', 5);
            if (data.camId == _this5.camId) {
                _this5.dateStamp = parseInt(data.dateStamp);
                _this5.image = data.image;
            }
        });
        socket.on('captrureStatus', function (data) {
            if (data.camId != _this5.camId) return;
            _this5.activeCapture = data.captureStatus;
        });
    },

    methods: {
        startCapture: function startCapture() {
            console.log('video', 1);
            this.activeCapture = true;
            socket.emit('startCapture', { camId: this.camId });
        }
    },
    computed: {
        cssObj: function cssObj() {
            return this.cssClasses.split(' ').reduce(function (obj, val) {
                return obj[val] = true, obj;
            }, {});
        },
        getImageURL: function getImageURL() {
            return this.imageUrl + '?d=' + this.dateStamp;
        },
        imageDate: function imageDate() {
            return this.dateStamp > 0 ? moment(this.dateStamp).calendar() : '';
        },
        buttonText: function buttonText() {
            return this.activeCapture ? 'Ζωντανή Εικόνα' : 'Έναρξη Λήψης';
        }
    }
});

function askReport() {
    socket.emit('raspberryStatus');
    socket.emit('weatherData');
}

function listen() {
    var _this6 = this;

    socket.on('raspberryStatus', function (data) {
        console.log("Ok the status!!", data);
        _this6.raspberryConnected = data.connected;
    });

    socket.on('weatherData', function (data) {
        console.log("Ok the weather!!", data);
        _this6.temperature = data.temperature;
        _this6.humidity = data.humidity;
    });

    socket.on('errorMessage', function (err) {
        console.log(err);
    });
}

function initMap() {
    var position = { lat: 35.32098178540996, lng: 25.10274052619934 };
    var icon = '/public/img/house-icon.png';

    map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 14
    });

    homeMarker = new google.maps.Marker({
        map: map,
        position: position,
        icon: icon
    });

    userMarker = new google.maps.Marker({
        map: map,
        title: 'Your position'
    });

    console.log('Map i showing!!');
}

var app = new Vue({
    el: '#root',
    data: {
        raspberryConnected: false,
        temperature: 0,
        humidity: 0,
        currentUser: '',
        loading: true
    },
    created: function created() {
        listen.call(this);
    },
    mounted: function mounted() {
        askReport();
        this.loading = false;

        if (window.Notification && Notification.permission !== "denied" && Notification.permission !== "granted") {
            Notification.requestPermission().then(function (response) {
                if (response === 'denied') {
                    iziToast.warning({
                        title: 'Notifications',
                        message: 'It\'s Ok you still can watch these notifications\n                                 and can enable the browser\'s web notifications later by click the page options left to addrees bar',
                        timeout: 15000,
                        position: 'topLeft'
                    });
                }
            });
        }
    },

    methods: {},
    computed: {}
});