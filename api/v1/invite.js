var router = require('express').Router({mergeParams: true});
var request = require('request');

var storage = require('../../storage');
var utils = require('./utils.js');
var gcm = require('./gcm.js');

router.post('/', utils.mws.jsonInputEnforcer, function(req, res, next) {

    var info = utils.decodeJwt(req.body.code);
    var gcm_id = req.body.gcm_id;

    storage.employees.getByHash(info.company_id, info.hash, info.email).then(function(employeeRes) {

        if(!employeeRes || !employeeRes.rows || employeeRes.rows.length <= 0) {
            next({status: 404});
            return;
        }

        var employee = employeeRes.rows[0];
        employee.invite_sent = true;
        employee.invite_accepted = true;
        employee.gcm_id = gcm_id;

        return gcm.test(gcm_id).then(function() {
            storage.employees.save(employee).then(function(employeeRes) {
                res.status(200).json(employeeRes.rows[0]).end();
            });
        });

    }, function(err) {
        next(err);
    }).done();
    
});

module.exports = router;
