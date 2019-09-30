const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
let rfs = require('rotating-file-stream');

const app = express();
const port = 5000;
let logDirectory = path.join(__dirname, 'log');

app.use(cors());

let accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
});

app.use(morgan('dev', { stream: accessLogStream }));
app.use(express.json());
// app.use(bodyParser.urlencoded({extended: false}));

const uri = 'mongodb://mongodb:27017/testDemain';
// const uri = 'mongodb://localhost:27017/pruebaLogin';

mongoose.connect(uri, {
    useNewUrlParser: true, useCreateIndex: true
}).catch(err => console.log('Error: ' + err));

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully')
});

const router = require('./routes/router');
app.use('/', router);
// app.route('*').get((req,res)=>{
//     res.sendFile(__dirname+'/frontend/public/index.html');
// });

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});

app.use((req, res, next) => {
    next(createError(404));
});

module.exports = app;