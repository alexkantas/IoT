// Libraries
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const assert = require('assert');
const cons = require('consolidate');

// Basic Variables
const app = express();
const port = 5000;

// Router
const mainRouter = require('./routes/mainRoutes')();

// Set up view engine and views extension
app.use('/public', express.static(__dirname + '/public')); //file in public directory served in public route
app.engine('html', cons.ejs); // assign the ejs engine to .html files
app.set('view engine', 'html'); // set .html as the default extension
app.set('views', __dirname + '/views');

// Seesions and Passport setup
app.use(session({ secret: 'th3s1s', saveUninitialized: true, resave: true }));
require('./core/passport')(app);

// Socket IO logic
require('./core/socketLogic')(app, port);

// Assign routes
app.use('/', mainRouter);

// Listening
//app.listen(port, () => { console.log(`Server listen on port ${port}`) });