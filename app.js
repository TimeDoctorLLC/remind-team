var ENV = process.env.NODE_ENV || 'development';
require('dotenv').config({ path: '../config/' + ENV + '.env' });
var debug = require('debug')('app');
var _ = require('underscore');

// check env variables
if(!process.env.DATABASE_URL || !process.env.GCM_API_KEY) {
    console.error('Must supply environment variables DATABASE_URL and GCM_API_KEY');
    process.exit(1);
}

// scheduler setup
var scheduler = require('./scheduler');
scheduler.start();

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

if (process.env.SSL_PORT && process.env.SSL_KEY && process.env.SSL_CERT) {
    // setup https for local testing
    var fs = require('fs');
    var https = require('https');
    var privateKey  = fs.readFileSync('../config/' + process.env.SSL_KEY, 'utf8');
    var certificate = fs.readFileSync('../config/' + process.env.SSL_CERT, 'utf8');

    var credentials = { key: privateKey, cert: certificate };
    
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(process.env.SSL_PORT);
    httpsServer.on('error', onError(httpsServer));
    httpsServer.on('listening', onListening(httpsServer));
}

// http server setup
var server = http.createServer(app);
server.listen(port);
server.on('error', onError(server));
server.on('listening', onListening(server));

function onError(server) {
    return function(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var addr = server.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;

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
    };
}

function onListening(server) {
    return function() {
        var addr = server.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        debug('Listening on ' + bind);
    };
}
