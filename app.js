var ENV = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: '../config/' + ENV + '.env' });
var debug = require('debug')('app');
var _ = require('underscore');

// check env variables
if(!process.env.DATABASE_URL || !process.env.GCM_API_KEY) {
    console.error('Must supply environment variables DATABASE_URL and GCM_API_KEY');
    process.exit(1);
}

// api setup
var http = require('http');
var express = require('express');
var path = require('path');

var app = express();
var apiv1 = require('./api/v1');

var port = process.env.PORT || '3000';
app.set('port', port);

if (ENV === 'production') {
  app.set('trust proxy', 1) // trust nginx proxy
}

// setup swagger
app.use('/api/v:version/docs', function(req, res, next) {
    if(!req.query.url && (!req.url || req.url == '/')) {
        // append the yaml url query param
        res.redirect('/api/v' + req.params.version + '/docs?url=/api/v' + req.params.version + '/swagger.yaml');
    } else {
        next();
    }
}, express.static('node_modules/swagger-ui/dist'));

// setup api v1
app.use('/api/v1/swagger.yaml', express.static('api/v1/swagger.yaml'))
app.use('/api/v1', apiv1);

// setup front-end
app.use(express.static(__dirname + '/web/dist'));
var FRONTEND_PATHS = [
    '/', '/signup', '/invite/:code', /.*\.(html|htm)$/
];
_.each(FRONTEND_PATHS, function(path) {
    app.use(path, function(req, res, next) {
        res.sendFile(__dirname + '/web/dist/index.html');
    });
});

// http server setup
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
