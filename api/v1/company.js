var router = require('express').Router({mergeParams: true});
var Q = require('q');
var _ = require('underscore');
var bcrypt = require('bcrypt');

var logger = require('../../globals/logger.js').api;
var storage = require('../../storage');
var utils = require('./utils.js');
var mailer = require('./mailer.js');
var datetime = require('../../globals/datetime.js');

function getInviteCode(employee) {
    return utils.createJwt({
        company_id: employee.company_id,
        email: employee.email,
        hash: employee.invite_hash
    });
}

function fillInviteCodes(employees) {
    return _.map(employees, function(employee) {
        employee.invite_code = getInviteCode(employee);
        return employee;
    });
}

function sendInvites(company, employees) {
    if(!employees || employees.length <= 0) {
        return Q();
    }

    return Q.all(_.reduce(employees, function(arr, employee) {
        if(!employee.invite_ts) {
            // send invite
            var inviteCode = getInviteCode(employee);
            
            logger.info('Sending invite...', employee, inviteCode);

            arr.push(mailer.sendInvite(company, employee.email, inviteCode).then(function() {
                employee.invite_ts = datetime.getCurrentTimestamp();
                return storage.employees.save(employee);
            }).then(function() {
                logger.info('Invite sent!', employee.email);
            }));
        }

        return arr;
    }, []));
}

var jwtEnforcer = utils.mws.jwtEnforcer();

function saveCompany(req, res, next) {

    if(req.company && req.company.company_id != req.params.companyId) {
        next({ status: 404 });
        return;
    }

    if(!req.company && !req.body.user_password) {
        next({ status: 400 });
    }

    var company = _.extend({}, req.company || {}, req.body, { 
        company_id: req.company ? req.company.company_id : null 
    });
    if(req.body.user_password) {
        var salt = bcrypt.genSaltSync(10);
        company.user_password = bcrypt.hashSync(req.body.user_password, salt);
    }

    var initPromise = Q();

    if(!req.company) {
        // check if company is disabled and use company_id; otherwise it will conflict (409)
        initPromise = storage.companies.getByUserEmail(company.user_email, true).then(function(companyRes) {
            if(companyRes && companyRes.rows && companyRes.rows.length > 0) {
                company.company_id = companyRes.rows[0].company_id;
            }
        });
    }
    
    return initPromise.then(function() {
        return storage.db.begin();
    }).then(function(trans) {
        // save team
        return storage.companies.save(company, trans).then(function(newCompany) {
            company.company_id = newCompany.rows[0].company_id;
            if(company.employees) {
                // save employees
                return storage.employees.replace(company.company_id, company.employees, trans);
            }
        }).then(trans.commit, function(err) {
            trans.rollback().done();
            throw err;
        });
    }).then(function(transRes) {
        if(transRes.length <= 1) {
            company.employees = [];
            return;
        }
        company.employees = transRes[transRes.length - 1].rows;
        fillInviteCodes(company.employees);
        return sendInvites(company, company.employees);
    }).then(function() {
        delete company.user_password;
        res.status(200).json({
            at: utils.createJwt({ company_id: company.company_id, user_email: company.user_email }),
            company: company
        }).end();
    }, function(err) {
        next(err);
    }).done();    
}

router.get('/:companyId', jwtEnforcer, function(req, res, next) {
    if(req.company.company_id != req.params.companyId) {
        next({ status: 404 });
    } else {
        delete req.company.user_password;
        req.company.employees = fillInviteCodes(req.company.employees);
        res.status(200).json(req.company).end();
    }
});

router.post('/', utils.mws.jsonInputEnforcer, saveCompany);

router.post('/:companyId', utils.mws.jsonInputEnforcer, jwtEnforcer, saveCompany);

module.exports = router;
