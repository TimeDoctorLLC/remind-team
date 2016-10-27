var router = require('express').Router({mergeParams: true});
var _ = require('underscore');
var moment = require('moment');
var Q = require('q');

var logger = require('../../globals/logger.js').api;
var mailer = require('./mailer.js');
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

function getInviteCode(employee) {
    return utils.createJwt({
        company_id: employee.company_id,
        email: employee.email,
        hash: employee.invite_hash
    });
}

function sendInvites(company, employees) {
    if(!employees || employees.length <= 0) {
        return Q();
    }

    return Q.all(_.map(employees, function(employee) {
        // send invite
        var inviteCode = getInviteCode(employee);
        
        logger.info('Sending another invite...', employee, inviteCode);

        return mailer.sendInvite(company, employee.email, inviteCode).then(function() {
            employee.invite_ts = datetime.getCurrentTimestamp();
            return storage.employees.save(employee);
        }).then(function() {
            logger.info('Another invite sent!', employee.email);
        });
    }));
}

var jwtEnforcer = utils.mws.jwtEnforcer();

router.post('/:employeeId/remind', jwtEnforcer, function(req, res, next) {

    return storage.employees.get(req.params.employeeId).then(function(employeeRes) {
        if(!employeeRes || !employeeRes.rows || employeeRes.rows.length <= 0) {
            throw { status: 404, message: 'employee not found' };
        }

        var employee = employeeRes.rows[0];
        if(employee.company_id != req.company.company_id) {
            throw { status: 404, message: 'employee not found' };
        }

        if(employee.invite_ts) {
            // be sure we are not spamming the other person...
            var lastInviteMoment = moment.utc(employee.invite_ts);
            var currentMoment = moment.utc();
            var elapsedMs = currentMoment.diff(lastInviteMoment);

            // must wait for at least 6 hours
            if(elapsedMs < 21600000) {
                throw { status: 409, message: 'already sent, must wait'};
            }
        }

        return employee;
    }).then(function(employee) {
        return sendInvites(req.company, [employee]);
    }).then(function() {
        res.status(200).end();
    }, function(err) {
        next(err);
    }).done();    

});

module.exports = router;
