var debug = require('debug')('scheduler');
var _ = require('underscore');

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
                    return storage.employees.updateExpired(_.map(employeeRes.rows, function(employee) { return employee.employee_id; }), ts);
                });
            }
            logger.info('No new notifications to send!');
            return employeeRes;
        }).then(function(employeeRes) {
            debug('Updated GCM Employees', employeeRes ? employeeRes.rows : []);
        }, function(err) {
            logger.error('Unable to send goal GCM notifications!', err);
        }).done();

    }, 10000); // poll every 5 min. 300000 ms
};

scheduler.stop = function() {
    if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }

    logger.info('Stopped scheduler...');
};

module.exports = scheduler;