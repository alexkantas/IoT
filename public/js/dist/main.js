'use strict';

window.Event = new Vue();

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
        var _this = this;

        socket.on('deviceStatus', function (data) {
            console.log('5', data);
            if (data.deviceId == _this.deviceId) {
                _this.isDeviceEnabled = data.isEnabled;
                _this.isLoading = false;
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
        var _this2 = this;

        console.log(this.cssClasses, this.imageUrl, this.camId);
        socket.on('newImage', function (data) {
            console.log('Image 5', data);
            if (data.camId == _this2.camId) {
                _this2.dateStamp = parseInt(data.dateStamp);
                _this2.isLoading = false;
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

var app = new Vue({
    el: '#root',
    data: {
        userDistance: -1,
        raspberryConnected: false,
        temperature: 0,
        humidity: 0
    },
    created: function created() {
        listen.call(this);
    },
    mounted: function mounted() {
        var _this3 = this;

        //dance.call(this);
        askReport();
        socket.on('userLocation', function (data) {
            console.log("go " + data);
            _this3.userDistance = data;
        });
    },

    computed: {
        isUserNearby: function isUserNearby() {
            return this.userDistance > 0 && this.userDistance < 1000;
        }
    }
});

function dance() {
    var _this4 = this;

    setTimeout(function () {
        _this4.raspberryConnected = !_this4.raspberryConnected;
    }, 5000);

    setInterval(function () {
        _this4.userDistance -= 555;
        if (_this4.userDistance < 0 || _this4.userDistance > 3000) _this4.userDistance = 3000;
        Event.$emit('devStatusChanged', 1, true);
        socket.emit('initial', { userDistance: _this4.userDistance });
    }, 4500);

    setInterval(function () {
        if (_this4.userDistance < 0 || _this4.userDistance > 3000) _this4.userDistance = 3000;
        _this4.userDistance += 155;
        Event.$emit('devStatusChanged', 2, false);
        Event.$emit('devStatusChanged', 1, false);
    }, 9500);
}

function askReport() {
    socket.emit('raspberryStatus');
    socket.emit('weatherData');
}

function listen() {
    var _this5 = this;

    socket.on('raspberryStatus', function (data) {
        console.log("Ok the status!!", data);
        _this5.raspberryConnected = data.connected;
    });

    socket.on('weatherData', function (data) {
        console.log("Ok the weather!!", data);
        _this5.temperature = data.temperature;
        _this5.humidity = data.humidity;
    });

    socket.on('errorMessage', function (err) {
        console.log(err);
    });
}