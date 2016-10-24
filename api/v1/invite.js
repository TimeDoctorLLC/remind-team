var router = require('express').Router({mergeParams: true});
var request = require('request');

var logger = require('../../globals/logger.js').api;
var storage = require('../../storage');
var utils = require('./utils.js');
var gcm = require('./gcm.js');

function getInviteCode(employee) {
    return utils.createJwt({
        company_id: employee.company_id,
        email: employee.email,
        hash: employee.invite_hash
    });
}

router.post('/', utils.mws.jsonInputEnforcer, function(req, res, next) {

    var info = utils.decodeJwt(req.body.code);
    var gcm_id = req.body.gcm_id;

    storage.employees.getByHash(info.company_id, info.hash, info.email).then(function(employeeRes) {

        if(!employeeRes || !employeeRes.rows || employeeRes.rows.length <= 0) {
            throw {status: 404};
        }

        var employee = employeeRes.rows[0];
        employee.invite_sent = true;
        employee.invite_accepted = true;
        employee.gcm_id = gcm_id;

        return gcm.test(gcm_id).then(function() {
            return storage.employees.save(employee).then(function(employeeRes) {
                return employeeRes.rows[0];
            });
        });

    }).then(function(employee) {
        logger.info('Invitation accepted!', employee.employee_id, info);
        res.status(200).json({
            at: getInviteCode(employee),
            employee
        }).end();
    }, function(err) {
        next(err);
    }).done();
    
});

module.exports = router;
