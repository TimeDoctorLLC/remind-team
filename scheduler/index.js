var debug = require('debug')('scheduler');
var _ = require('underscore');
var Q = require('q');

var logger = require('../globals/logger.js').scheduler;
var storage = require('../storage');
var gcm = require('../api/v1/gcm.js');
var datetime = require('../globals/datetime.js');


var scheduler = {};

scheduler.start = function() {
    var t = this;

    logger.info('Started scheduler...');

    this.timer = setInterval(function() {
        var ts = datetime.getCurrentTimestamp();

        logger.info('Sending new notifications...', ts);

        return storage.employees.allExpiredAt(ts).then(function(employeeRes) {
            debug('GCM Employees', employeeRes.rows);
            if(employeeRes && employeeRes.rows && employeeRes.rows.length > 0) {
                return gcm.notify(_.map(employeeRes.rows, function(employee) { return employee.gcm_id; })).then(function(gcmResults) {
                    logger.info('GCM notifications sent successfully!', gcmResults);
                    return { employeeRes: employeeRes, gcmResults: gcmResults.results };
                }, function(err) {
                    if(!err.gcm || err.code != 400) {
                        throw err;
                    }
                    return { employeeRes: employeeRes, gcmResults: err.results };
                });
            }
            logger.info('No new notifications to send!');
            return Q({ gcmResults: [], employeeRes: employeeRes });
        }).then(function(data) {
            return Q.all(_.reduce(data.gcmResults, function(arr, result, i) {
                if(result.error) {
                    var employee = data.employeeRes.rows[i];
                    if(result.error == 'NotRegistered') {
                        employee.invite_accepted = false;
                        employee.gcm_id = null;
                        arr.push(storage.employees.save(employee));
                    } else {
                        logger.error('Unable to send GCM notification', employee, result.error);
                    }
                }
                return arr;
            }, [])).then(function() {
                return data.employeeRes;
            });
        }).then(function(employeeRes) {
            debug('Updated GCM Employees', employeeRes ? employeeRes.rows : []);
        }, function(err) {
            logger.error('Unable to send GCM notifications!', err);
        }).then().done();

    }, 30000); // poll every 30 secs.
};

scheduler.stop = function() {
    if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }

    logger.info('Stopped scheduler...');
};

module.exports = scheduler;