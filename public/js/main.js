let map;
let homeMarker;
let userMarker;
window.Event = new Vue();

Vue.component('mapmodal', {
    data() {
        return {
            homelocation: {},
            userlocation: {}
        }
    },
    mounted() {
        initMap()
        Event.$on('reloadMap', data => {
            setTimeout(() => {
                google.maps.event.trigger(map, 'resize');
                if (data && data.location) map.panTo(data.location);
            }, 100);
        })
    },
    template: `<div class="modal is-active">
    <div class="modal-background" @click="$emit('close')"></div>
    <div class="modal-content">
    <div class="modalMap notification is-info">
    <section id="map" class="map">Loading map...</section>
    </div></div>
    <button class="modal-close is-large" aria-label="close" @click="$emit('close')"></button>
    </div>`
})

Vue.component('userbox', {
    props: ['username', 'index', 'distance'],
    data() {
        return {
            userDistance: 1000,
        }
    },
    computed: {
        isUserNearby() {
            const distanceLimit = 100;
            return this.userDistance > 0 && this.userDistance < distanceLimit;
        }
    },
    mounted() {
        this.userDistance = this.distance;
        socket.on('userLocation', (data) => {
            if (data.username != this.username) return;
            const distanceLimit = 100;
            const userJustArrived = data.distance < distanceLimit && !(this.userDistance > 0 && this.userDistance < distanceLimit) && data.distance < this.userDistance // True if user not home, new distance less than distanceLimit and smaller tha previous
            if (userJustArrived) {
                let title = `${this.username} just arrived at home!`;
                iziToast.success({
                    title,
                    timeout: 10000
                });
                new Notification(title);
            }
            this.userDistance = data.distance;
            console.log(data.location);
            window.Event.$emit('updateMarker', { username: this.username, index: this.index, position: { lat: data.location.latitude, lng: data.location.longitude } });
        });
    },
    template: `<div class="column is-narrow">
    <div :class="{'is-danger':!isUserNearby,'is-success':isUserNearby}" class="notification">
    <span class="icon littleMargin">
    <i class="fa  fa-map-marker fa-2x"></i>
    </span>
    {{username}} is <strong>{{userDistance}}</strong> meters away from home!
    </div></div>`
});

Vue.component('usersarea', {
    data() {
        return {
            users: [],
            mapModal: false,
        }
    },
    methods: {
        showMap(username, i) {
            this.mapModal = true;
            this.currentUser = username;
            userMarker.setPosition(this.users[i].position);
            Event.$emit('reloadMap', { location: this.users[i].position });
        },
        hideModal() {
            this.mapModal = false;
        }
    },
    mounted() {
        Event.$on('updateMarker', data => {
            this.users[data.index].position = data.position;
            if (this.currentUser === data.username) {
                userMarker.setPosition(data.position);
                map.panTo(data.position);
            }
            Event.$emit('reloadMap');
        });
        socket.on('userLocation', (data) => {
            console.log('Dater are ' + this.users.findIndex(u => u.username === data.username));
            if (this.users.findIndex(u => u.username === data.username) === -1) {
                this.users.push({ username: data.username, distance: data.distance, position: { lat: data.location.latitude, lng: data.location.longitude } });
            }
        })
    },
    template: `<div>
    <mapmodal v-show="mapModal" @close="hideModal"></mapmodal>
    <section class="columns usersArea">
        <template  v-for="(user,index) of users">
            <userbox :username="user.username" :index="index" :distance="user.distance" @click.native="showMap(user.username,index)"></userbox>
        </template>
    </section>
    </div>`
})

Vue.component('device', {
    props: {
        deviceId: { type: Number, required: true },
        iconClass: String,
        meters: { type: Number, default: 0 },
        temp: { type: Number, default: 0 },
        enabled: { type: Boolean, default: false },
    },
    data() {
        return {
            isDeviceEnabled: this.enabled,
            isLoading: false
        }
    },
    computed: {
        statusText() {
            return this.isDeviceEnabled ? 'Device Enabled' : 'Device Disabled';
        },
        buttonText() {
            return this.isDeviceEnabled ? ' Disable' : 'Instant Enable';
        },
        statusClass() {
            return this.isDeviceEnabled ? 'has-text-success' : 'has-text-danger';
        }
    },
    methods: {
        changeDeviceStatus() {
            this.isLoading = true;
            iziToast.success({
                title: 'Changing LED status',
                message: `In the actual project, available on github, the LED on Rapberry Pi will change status. Now the status will be change after this notification`,
                timeout: 15000,
                position: 'bottomCenter',
                pauseOnHover: false,
            });
            setTimeout(()=>{
                this.isLoading = false;
                this.isDeviceEnabled = !this.isDeviceEnabled;
            },15000);
        }
    },
    template: `<div class="tile is-child box notification is-warning">
    <p class="title"><slot></slot></p>
    <div class="columns">
        <div class="column centeredElements">
            <span class="icon">
            <i class="fa fa-5x" :class="iconClass"></i>
            </span>
            <p class="title has-text-centered" :class="statusClass">{{statusText}}</p>
        </div>
        <div class="column">
            <p>Η συσκευή ενεργοποιήτε αυτόματα όταν:</p>
            <p v-if="meters > 0">O χρήστης είναι <strong>{{meters}}</strong> μέτρα μακριά από το σπίτι.</p>
            <p v-if="temp > 0">Η θερμοκρασία κάτω από <strong>{{temp}}</strong> βαθμούς κελσίου</p>
            <p class="topMargin"><button class="button is-large is-success is-outlined is-inverted" :class="{'is-loading':isLoading}" @click="changeDeviceStatus">{{buttonText}}</button></p>
        </div>
    </div>
</div>`
});


Vue.component('video-area', {
    props: ['cssClasses', 'imageUrl', 'camId'],
    data() {
        return {
            dateStamp: 0,
            activeCapture: false,
            image: ''
        }
    },
    template: `<div class="tile is-child box notification is-info">
    <p class="title">Capture</p>
    <p><slot></slot><strong>{{imageDate}}</strong></p>
    <figure :class="cssObj">
        <img :src="image">
    </figure>
    <p class="topMargin has-text-centered"><button class="button is-large is-warning is-outlined is-inverted" @click="startCapture" :disabled="activeCapture">{{buttonText}}</button></p>
</div>`,
    created(){
        this.image = this.imageUrl;
    },
    methods: {
        startCapture() {
            this.dateStamp = parseInt(Date.now());
            this.activeCapture = true;
            iziToast.success({
                title: 'Live capture',
                message: `In the actual project, available on github, the capture from cameras on Raspberry Pi is showing`,
                timeout: 10000,
                position: 'bottomCenter',
                pauseOnHover: false,
            });
            setTimeout(()=>{
                this.activeCapture = false;
            },10000)
        }
    },
    computed: {
        cssObj() {
            return this.cssClasses.split(' ').reduce((obj, val) => (obj[val] = true, obj), {});
        },
        getImageURL() {
            return `${this.imageUrl}?d=${this.dateStamp}`;
        },
        imageDate() {
            return this.dateStamp > 0 ? moment(this.dateStamp).calendar() : '';
        },
        buttonText(){
            return this.activeCapture ? 'Live capture' : 'Start capture' ; 
        }
    }
});

function askReport() {
}

function listen() {

}

function initMap() {
    let position = { lat: 35.32098178540996, lng: 25.10274052619934 };
    let icon = '/public/img/house-icon.png';

    map = new google.maps.Map(document.getElementById('map'), {
        center: position,
        zoom: 14
    });

    homeMarker = new google.maps.Marker({
        map,
        position,
        icon
    });

    userMarker = new google.maps.Marker({
        map,
        title: 'Your position'
    });

    console.log('Map i showing!!');
}

const app = new Vue({
    el: '#root',
    data: {
        raspberryConnected: false,
        temperature: 0,
        humidity: 0,
        currentUser: '',
        navbar:false,
        loading: true
    },
    created() {
        listen.call(this);
    },
    mounted() {
        askReport();
        this.loading = false;

        if (window.Notification && Notification.permission !== "denied" && Notification.permission !== "granted") {
            Notification.requestPermission().then(response => {
                if (response === 'denied') {
                    iziToast.warning({
                        title: 'Notifications',
                        message: `It's Ok you still can watch these notifications
                                 and can enable the browser's web notifications later by click the page options left to addrees bar`,
                        timeout: 15000,
                        position: 'topLeft'
                    });
                }
            })
        }
    },
    methods: {
        raspberryStatus(){
            iziToast.success({
                title: 'Changing Raspberry Pi status',
                message: `In the actual project, available on github, the status of Rapberry Pi is showing. Now the status will be change after this notification`,
                timeout: 10000,
                position: 'bottomCenter',
                pauseOnHover: false,
            });
            setTimeout(()=>{
                this.raspberryConnected = !this.raspberryConnected;
            },10000)
        },
        temperatureStatus(){
            iziToast.success({
                title: 'Weather data value',
                message: `In the actual project, available on github, the value of sensors on Rapberry Pi is showing. Now the value will be incresead by 10 after this notification`,
                timeout: 10000,
                position: 'bottomCenter',
                pauseOnHover: false,
            });
            setTimeout(()=>{
                this.temperature+=10;
                this.humidity+=10;
            },10000)
        }
    }
});