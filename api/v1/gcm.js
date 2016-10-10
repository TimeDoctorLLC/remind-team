var Q = require('q');
var request = require('request');

var ENDPOINT = 'https://android.googleapis.com/gcm/send';

var gcm = {};

gcm.test = function(registrationId) {
    var deferred = Q.defer();

    var data = {
        title: 'Welcome to Goal Reminder',
        body: 'You\'ll now start receiving notifications with your Goals!',
        icon: ''
    };

    request.post({
        url: ENDPOINT,
        headers: {
            "Authorization": 'key=' + process.env.GCM_API_KEY
        },
        json: true,
        body: {
            to: registrationId,
            notification: data,
            data: data
        }    
    }, function(error, response, body) {
        if(error || response.statusCode != 200) {
            deferred.reject({ gcm: true, code: response.statusCode, body: body });
            return;
        }

        if(!body.success) {
            deferred.reject({ gcm: true, code: 400, body: body });
            return;
        }

        deferred.resolve(body);
    });

    return deferred.promise;
};

gcm.notify = function(registrationId, goals) {
    var deferred = Q.defer();

    var data = {
        title: 'Goals',
        body: goal.join(', '),
        icon: ''
    };

    request.post({
        url: ENDPOINT,
        headers: {
            "Authorization": 'key=' + process.env.GCM_API_KEY
        },
        json: true,
        body: {
            to: registrationId,
            notification: data,
            data: data
        }    
    }, function(error, response, body) {
        if(error || response.statusCode != 200) {
            deferred.reject({ gcm: true, code: response.statusCode, body: body });
            return;
        }

        if(!body.success) {
            deferred.reject({ gcm: true, code: 400, body: body });
            return;
        }

        deferred.resolve(body);
    });

    return deferred.promise;
};

module.exports = gcm;
