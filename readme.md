# Home Monitoring IoT System

This repo contains my [thesis](apothesis.lib.teicrete.gr) project. It’s dealing with the build and the implementation way of a location-based **Internet of Things** System.

![diagram_of_system](https://alexzzzboom.github.io/img/thesis/fullSystemDiagram.jpg)
 
The system is built with a **Raspberry Pi** in which are attached several devices such cameras and LEDs. The attached devices are controlling by a **NodeJS** application which acts as client and it’s responsible for sending and receiving information from Server. The Server, also built with **NodeJS**, acts as the middleman between the Raspberry Pi and the users’ web application. The users’ web application is build on JavaScript Framework **VueJS** with components of CSS Framework **Bulma**. In the web application the user can monitor and manipulate the devices’ status. Also he can monitor the location of other users and get notified when someone is arriving home. User’s location is accessible through web browsers’ **geolocation API** and is been displayed with use of **Google Maps API**. All real-time functions are made through **SocketIO**.

A detailed documentation, *in Greek*, can be found [here](https://thesis.kantas.net/documentation).