var Q = require('q');
var _ = require('underscore');
var validator = require('validator');

var pg = require('node-pg-easy');
var sql = require('node-pg-sqlbuilder');

var datetime = require('../globals/datetime.js');
var ex = require('./exceptions.js');

var employees = require('./model_employee.js');

module.exports = function(db, eventTracker) {
    db = db || pg({ connStr: process.env.DATABASE_URL });

    var employeeModel = employees(db, eventTracker);
    
    var TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
    
    var TABLE = 'tbl_company';
    var INSERT_FIELDS = 'user_name, user_email, user_password, registration_ts';
    var RETURN_FIELDS = [
        'tbl_company.company_id',
        'tbl_company.user_name',
        'tbl_company.user_email',
        'tbl_company.user_password',
        'tbl_company.notification_interval',
        'to_char(tbl_company.registration_ts, \'' + TIMESTAMP_FORMAT + '\') as registration_ts', 
        '(CASE WHEN tbl_company.deactivation_ts IS NULL THEN NULL ELSE to_char(tbl_company.deactivation_ts, \'' + TIMESTAMP_FORMAT + '\') END) as deactivation_ts'
    ];

    function loadExtras(promise, extras) {
        promise = promise.then(function(companyRes) {
            if(!companyRes) {
                return companyRes;
            }
            return _.reduce(companyRes.rows, function(promise, company) {
                return promise.then(function() {
                    return employeeModel.allByCompanyId(company.company_id, false).then(function(employeeRes) {
                        company.employees = employeeRes.rows;
                        return companyRes;
                    });
                });
            }, Q());
        });
        
        if(!extras) {
            return promise;
        }
        
        return promise;
    }
    
    var model = {};
    
    model.get = function(id, includeDeleted, extras) {
        var query = sql.select(RETURN_FIELDS).from(TABLE).where('company_id = $1' + (includeDeleted ? '' : ' AND deactivation_ts IS NULL')).end().build();
        var promise = db.execute(query, [id]);
        return loadExtras(promise, extras);
    };

    model.getByUserEmail = function(userEmail, includeDeleted, extras) {
        var query = sql.select(RETURN_FIELDS).from(TABLE).where('user_email = $1' + (includeDeleted ? '' : ' AND deactivation_ts IS NULL')).end().build();
        var promise = db.execute(query, [userEmail]);
        return loadExtras(promise, extras);
    };
    
    model.save = function(data, trans) {
        if(!data.user_name || !data.user_email || !data.user_password || !validator.isEmail(data.user_email)) {
            throw new ex.InvalidInputDataException('company', ['user_name', 'user_email', 'user_password', 'notification_interval']);
        }

        if(data.company_id) {
            // update
            var query = sql.update(TABLE).set(
                'user_name = $2', 
                'user_email = $3', 
                'user_password = $4', 
                'notification_interval = $5'
            ).where('company_id = $1').returning(RETURN_FIELDS).end().build();
            var args = [data.company_id, data.user_name, data.user_email, data.user_password, data.notification_interval];
            
            return (trans ? trans.execute(query, args) : db.execute(query, args)).then(function(res) {
                eventTracker && eventTracker.trigger('company.update', [res]);
                return res;
            }, function(err) {
                if(err.code == 23505) {
                    // unique/duplicate pgsql error
                    throw new ex.DuplicateRecordException('company', data);
                }
                throw err;
            });
        }
        
        data.registration_ts = datetime.getCurrentTimestamp();
        
        // insert
        var query = sql.insert(INSERT_FIELDS).into(TABLE).entry().returning(RETURN_FIELDS).end().build();
        var args = [data.user_name, data.user_email, data.user_password, data.registration_ts];
        
        return (trans ? trans.execute(query, args) : db.execute(query, args)).then(function(res) {
            data.company_id = res.rows[0].company_id;
            eventTracker && eventTracker.trigger('company.insert', [res]);
            return res;
        }, function(err) {
            if(err.code == 23505) {
                // unique/duplicate pgsql error
                throw new ex.DuplicateRecordException('company', data);
            }
            throw err;
        });
    };
    
    return model;
};
