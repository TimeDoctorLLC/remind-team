var Q = require('q');
var request = require('request');

var ENDPOINT = 'https://android.googleapis.com/gcm/send';

var gcm = {};

gcm.test = function(registrationId) {
    var deferred = Q.defer();

    request.post({
        url: ENDPOINT,
        headers: {
            "Authorization": 'key=' + process.env.GCM_API_KEY
        },
        json: true,
        body: {
            to: registrationId
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

gcm.notify = function(registrationIds) {
    var deferred = Q.defer();

    request.post({
        url: ENDPOINT,
        headers: {
            "Authorization": 'key=' + process.env.GCM_API_KEY
        },
        json: true,
        body: {
            registration_ids: registrationIds
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
