var moment = require('moment');

module.exports = (function() {
    var utils = {};
    
    utils.TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';
    utils.DATE_FORMAT = 'YYYY-MM-DD';
    utils.TIME_FORMAT = 'HH:mm';
    
    utils.getCurrentTimestamp = function() {
        return moment.utc().format(utils.TIMESTAMP_FORMAT);
    };
    
    utils.getYesterdayDateString = function() {
        return moment.utc().subtract(1, 'days').format(utils.DATE_FORMAT);
    };
    
    utils.getTomorrowDateString = function() {
        return moment.utc().add(1, 'days').format(utils.DATE_FORMAT);
    };
    
    utils.getCurrentDateString = function() {
        return moment.utc().format(utils.DATE_FORMAT);
    };
    
    utils.getCurrentTimeString = function() {
        return moment.utc().format(utils.TIME_FORMAT);
    };
    
    return utils;
})();