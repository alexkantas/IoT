# Home Monitoring IoT System

This repo contains my [thesis](https://apothesis.lib.teicrete.gr/) project. It’s dealing with the build and the implementation way of a location-based **Internet of Things** System.

![diagram_of_system](https://alexkantas.github.io/img/thesis/fullSystemDiagram.jpg)
 
The system is built with a **Raspberry Pi** in which are attached several devices such cameras and LEDs. The attached devices are controlling by a **NodeJS** application which acts as client and it’s responsible for sending and receiving information from Server. The Server, also built with **NodeJS**, acts as the middleman between the Raspberry Pi and the users’ web application. The users’ web application is build on JavaScript Front-end Framework **VueJS** with components of CSS Framework **Bulma**. In the web application the user can monitor and manipulate the devices’ status. Also he can monitor the location of other users and get notified when someone is arriving home. User’s location is accessible through web browsers’ **geolocation API** and is been displayed with use of **Google Maps API**. All real-time functions are made through **SocketIO**.

![user_dashboard](https://alexkantas.github.io/img/thesis/userDashboard.jpg)

A detailed documentation, *in Greek*, can be found [here](https://thesis.kantas.net/documentation).

## Run the project in your machine

You should have both **Git** and **NodeJS** installed on your **Computer** and your **Raspberry Pi**.

### On Computer

1. Type `git clone https://github.com/alexzzzboom/IoT.git`
2. `cd IoT`
3. `npm i`
4. `node index.js`

Your project now should be runing at port 5000 in your local machine

### On Raspberry Pi

1. `git clone https://github.com/alexzzzboom/IoT.git`
2. `cd IoT/raspberryPi`
3. `npm i`
4. Type `nano rasperryPi.js` change the value of `url` variable in second line with your local IP.
5. Check that the value of `sensorPin` variable on line 38 and `devices` variable on line 43 and 49 have the proper number based on your set up.  
6. In nano editor press `Ctrl + X` to exit and `Y` to save the changes.
5. `node raspberryPi.js`

Browse on `Your_IP:5000`, manipulate the LEDs values, monitor the humidity and temperature values and get live capture from the cameras!
