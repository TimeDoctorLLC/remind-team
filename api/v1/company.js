var router = require('express').Router({mergeParams: true});
var Q = require('q');
var _ = require('underscore');
var bcrypt = require('bcrypt');

var logger = require('../../globals/logger.js').api;
var storage = require('../../storage');
var utils = require('./utils.js');
var mailer = require('./mailer.js');

storage.on('employee.insert,employee.update', function(employeeRes) {
    if(!employeeRes || !employeeRes.rows) {
        return;
    }

    _.each(employeeRes.rows, function(employee) {
        if(!employee.invite_sent) {
            // send invite
            var inviteCode = utils.createJwt({
                company_id: employee.company_id,
                email: employee.email,
                hash: employee.invite_hash
            });
            
            console.log('sending invite...', employee, inviteCode);

            storage.companies.get(employee.company_id).then(function(companyRes) {
                return mailer.sendInvite(companyRes.rows[0], employee.email, inviteCode);
            }).then(function() {
                //employee.invite_sent = true;
                //return storage.employees.save(employee);
            }, function(err) {
               logger.error('Unable to send invitation to employee!', employee, err);
            }).done();
        }
    });
});

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

    // TODO check if company is disabled and use company_id; otherwise it will conflict (409)
    
    return storage.db.begin().then(function(trans) {
        // save team
        return storage.companies.save(company, trans).then(function(newCompany) {
            company.company_id = newCompany.rows[0].company_id;
            if(company.employees) {
                // save employees
                return storage.employees.replace(company.company_id, company.employees, trans).then(function(employeeRes) {
                    company.employees = employeeRes.rows;
                });
            }
        }).then(trans.commit, function(err) {
            trans.rollback().done();
            throw err;
        });
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
        res.status(200).json(req.company).end();
    }
});

router.post('/', utils.mws.jsonInputEnforcer, saveCompany);

router.post('/:companyId', utils.mws.jsonInputEnforcer, jwtEnforcer, saveCompany);

module.exports = router;
