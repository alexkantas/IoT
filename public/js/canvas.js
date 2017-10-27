const canvas = document.getElementById('superCanvas');
const ctx = canvas.getContext("2d");
ctx.fillStyle = 'Green';
ctx.fillRect(300, 200, 200, 100);
//
const imagination = new Image();

function loadImage(data) {
    imagination.src = data;
    imagination.onload = () => {
        console.log('run');
        console.log(canvas.width,canvas.height);
        ctx.drawImage(imagination, 0, 0, canvas.width, canvas.height);
        
        console.log('runed');
    }
}

const app = new Vue({
    el: '#root',
    data: {
        i: 0,
        source: ''
    },
    mounted() {
        console.log('all good!');
        console.log(canvas.width,canvas.height);
        socket.on('newimage', (data) => {
            this.i = data.number;
            this.source = data.image;
            console.log(`Παίρνω φωτογραφία ${data.number}`);
            loadImage(data.image);
        });
    },
    computed: {
    }
});
