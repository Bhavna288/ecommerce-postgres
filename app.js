const express = require('express');

const bodyParser = require('body-parser');
require('dotenv').config()

const port = 3000;
const morgan = require('morgan');
const sequelize = require('./config/database');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('combined'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
require('./router.js')(app);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to this website" });
});
sequelize
    .sync()
    .then(result => {
        app.listen(port);
    })
    .catch(err => {
        console.log(err);
    });