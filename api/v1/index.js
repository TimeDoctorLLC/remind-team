var debug = require('debug')('api');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var _ = require('underscore');

var logger = require('../../globals/logger.js').api;

var auth = require('./auth.js');
var invite = require('./invite.js');
var companies = require('./company.js');
var employees = require('./employee.js');

var loggerRequestWhitelist = ['url', 'headers', 'method', 'httpVersion', 'originalUrl', 'query', 'params', 'body'];
var loggerResponseWhitelist = ['statusCode', 'body'];

router.use(bodyParser.json());

router.use('/auth', auth);
router.use('/companies/invite', invite);
router.use('/companies', companies);
router.use('/employees', employees);

// 404 if resource not found
router.use(function(req, res, next) {
    next({ status: 404 });
});

// send proper error status code and log entry
router.use(function(err, req, res, next) {
    res.status(err.status || 500);
        
    var obj = { err: err, stack: err.stack, req: {}, res: {} };
    
    _.each(loggerRequestWhitelist, function(key) {
        obj.req[key] = req[key];
    });
    _.each(loggerResponseWhitelist, function(key) {
        obj.res[key] = res[key];
    });
    
    if(err && (!err.status || Math.trunc(err.status / 100) == 5)) {
        logger.error(err.message, obj);
    } else {
        logger.warn(err ? err.message : '', obj);
    }
    
    if(err.slack || err.status < 500) {
        res.json({ slack: err.slack, message: err.message });
    }
    res.end();
});

module.exports = router;
