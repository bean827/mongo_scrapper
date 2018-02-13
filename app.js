const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');
const routes = require('./routes');

const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.static('public'));

// Mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines"; 
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));   // Check for errors on connection


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


app.use('/', routes);

app.listen(PORT, () => console.log(`News Scrapper listening on port ${PORT}`));