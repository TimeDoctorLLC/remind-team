var router = require('express').Router({mergeParams: true});
var _ = require('underscore');

var logger = require('../../globals/logger.js').api;
var storage = require('../../storage');
var datetime = require('../../globals/datetime.js');
var utils = require('./utils.js');

router.post('/poll', function(req, res, next) {

    var info = utils.decodeJwt(req.body.code);

    logger.info('Polled', info);

    storage.employees.getByHash(info.company_id, info.hash, info.email).then(function(employeeRes) {

        if(!employeeRes || !employeeRes.rows || employeeRes.rows.length <= 0) {
            throw {status: 404};
        }

        var ts = datetime.getCurrentTimestamp();
        return storage.employees.updateExpired(_.map(employeeRes.rows, function(employee) { return employee.employee_id; }), ts);

    }).then(function(employeeRes) {
        var employee = employeeRes.rows[0];
        res.status(200).json(employee.goals).end();
    }, function(err) {
        next(err);
    }).done();
});

module.exports = router;
