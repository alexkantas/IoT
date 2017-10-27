window.Event = new Vue();

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
            return this.isDeviceEnabled ? 'Συσκευή Ενεργή' : 'Συσκευή Ανενεργή';
        },
        buttonText() {
            return this.isDeviceEnabled ? 'Απενεργοποίηση' : 'Άμεση Ενεργοποίηση';
        },
        statusClass() {
            return this.isDeviceEnabled ? 'has-text-success' : 'has-text-danger';
        }
    },
    methods: {
        changeDeviceStatus() {
            this.isLoading = true;
            socket.emit('setDeviceStatus', { deviceId: this.deviceId, isEnabled: !this.isDeviceEnabled });
        }
    },
    created() {
        console.log('1');
        socket.emit('setDeviceStatus', { deviceId: this.deviceId, justReport: true });
    },
    mounted() {
        socket.on('deviceStatus', (data) => {
            console.log('5', data);
            if (data.deviceId == this.deviceId) {
                this.isDeviceEnabled = data.isEnabled;
                this.isLoading = false;
            }
        });
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

Vue.component('image-area', {
    props: ['cssClasses', 'imageUrl', 'camId'],
    data() {
        return {
            dateStamp: 0,
            isLoading: false
        }
    },
    template: `<div class="tile is-child box notification is-info">
    <p class="title">Εικόνα</p>
    <p><slot></slot><strong>{{imageDate}}</strong></p>
    <figure :class="cssObj">
        <img :src="getImageURL">
    </figure>
    <p class="topMargin has-text-centered"><button class="button is-large is-warning is-outlined is-inverted" :class="{'is-loading':isLoading}" @click="updateImage">Ανανέωση εικόνας</button></p>
</div>`,
    mounted() {
        console.log(this.cssClasses, this.imageUrl, this.camId);
        socket.on('newImage', (data) => {
            console.log('Image 5', data);
            if (data.camId == this.camId) {
                this.dateStamp = parseInt(data.dateStamp);
                this.isLoading = false;
            }
        });
    },
    methods: {
        updateImage() {
            console.log('Image 1');
            this.isLoading = true;
            socket.emit('updateImage', { camId: this.camId });
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
            return moment(this.dateStamp).calendar();
        }
    }
});

const app = new Vue({
    el: '#root',
    data: {
        userDistance: -1,
        raspberryConnected: false,
        temperature: 0,
        humidity: 0
    },
    created() {
        listen.call(this);
    },
    mounted() {
        //dance.call(this);
        askReport();
        socket.on('userLocation', (data) => {
            console.log(data);
            this.userDistance = data.distance;
        });
    },
    computed: {
        isUserNearby() {
            return this.userDistance > 0 && this.userDistance < 1000;
        }
    }
});

function dance() {
    setTimeout(() => {
        this.raspberryConnected = !this.raspberryConnected
    }, 5000);

    setInterval(() => {
        this.userDistance -= 555;
        if (this.userDistance < 0 || this.userDistance > 3000) this.userDistance = 3000;
        Event.$emit('devStatusChanged', 1, true);
        socket.emit('initial', { userDistance: this.userDistance });
    }, 4500)

    setInterval(() => {
        if (this.userDistance < 0 || this.userDistance > 3000) this.userDistance = 3000;
        this.userDistance += 155;
        Event.$emit('devStatusChanged', 2, false);
        Event.$emit('devStatusChanged', 1, false);
    }, 9500)
}

function askReport() {
    socket.emit('raspberryStatus');
    socket.emit('weatherData');
}

function listen() {

    socket.on('raspberryStatus', data => {
        console.log("Ok the status!!", data);
        this.raspberryConnected = data.connected;
    })

    socket.on('weatherData', data => {
        console.log("Ok the weather!!", data);
        this.temperature = data.temperature;
        this.humidity = data.humidity;
    })

    socket.on('errorMessage', err => {
        console.log(err);
    });
}