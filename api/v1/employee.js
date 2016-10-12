var router = require('express').Router({mergeParams: true});

var logger = require('../../globals/logger.js').api;
var storage = require('../../storage');
var utils = require('./utils.js');

router.post('/poll', function(req, res, next) {

    var info = utils.decodeJwt(req.body.code);

    logger.info('Polled', info);

    storage.employees.getByHash(info.company_id, info.hash, info.email).then(function(employeeRes) {

        if(!employeeRes || !employeeRes.rows || employeeRes.rows.length <= 0) {
            next({status: 404});
            return;
        }

        var employee = employeeRes.rows[0];
        res.status(200).json(employee.goals).end();

    }, function(err) {
        next(err);
    }).done();
});

module.exports = router;
