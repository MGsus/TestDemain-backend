const express = require('express');
const createError = require('http-errors');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
let rfs = require('rotating-file-stream');

const app = express();
let logDirectory = path.join(__dirname, 'log');

app.use(cors());

let accessLogStream = rfs('access.log', {
    interval: '1d',
    path: logDirectory
});

app.use(morgan('dev', {stream: accessLogStream}));
app.use(express.json());
// app.use(bodyParser.urlencoded({extended: false}));

let uri = process.env.NODE_ENV === 'production'
    ? 'mongodb+srv://demainRoot:demainRoot@demain-zdnjw.mongodb.net/test?retryWrites=true&w=majority'
    : 'mongodb://mongodb:27017/Demain';

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
let port = normalizePort(process.env.PORT || '5000');
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});


/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

// Error handler in dev
app.use((req, res, next) => {
    next(createError(404));
});

// error handler in production
// app.use((req, res, next) => {
//     res.status(404);
//     res.send('error');
// });

module.exports = app;