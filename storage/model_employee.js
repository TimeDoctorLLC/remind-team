var Q = require('q');
var _ = require('underscore');
var crypto = require('crypto');

var pg = require('node-pg-easy');
var sql = require('node-pg-sqlbuilder');

var datetime = require('../globals/datetime.js');
var ex = require('./exceptions.js');

module.exports = function(db, eventTracker) {
    db = db || pg({ connStr: process.env.DATABASE_URL });
    
    var TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
    
    var TABLE = 'tbl_employee';
    var INSERT_FIELDS = 'company_id, email, goals, invite_hash, registration_ts, last_notification_ts';
    var RETURN_FIELDS = [
        'tbl_employee.employee_id',
        'tbl_employee.company_id',
        'tbl_employee.email',
        'tbl_employee.goals',
        'tbl_employee.invite_hash',
        'tbl_employee.invite_accepted',
        'tbl_employee.invite_sent',
        'tbl_employee.gcm_id',
        '(CASE WHEN tbl_employee.last_notification_ts IS NULL THEN NULL ELSE to_char(tbl_employee.last_notification_ts, \'' + TIMESTAMP_FORMAT + '\') END) as last_notification_ts',
        'to_char(tbl_employee.registration_ts, \'' + TIMESTAMP_FORMAT + '\') as registration_ts', 
        '(CASE WHEN tbl_employee.deactivation_ts IS NULL THEN NULL ELSE to_char(tbl_employee.deactivation_ts, \'' + TIMESTAMP_FORMAT + '\') END) as deactivation_ts'
    ];
    
    var model = {};
    
    model.get = function(id, includeDeleted) {
        var query = sql.select(RETURN_FIELDS).from(TABLE).where('employee_id = $1' + (includeDeleted ? '' : ' AND deactivation_ts IS NULL')).end().build();
        return db.execute(query, [id]);
    };

    model.getByHash = function(companyId, hash, email) {
        var query = sql.select(RETURN_FIELDS).from(TABLE).where('company_id = $1', 'invite_hash = $2', 'email = $3').end().build();
        return db.execute(query, [companyId, hash, email]);
    };

    model.allByCompanyId = function(companyId, includeDeleted, trans) {
        var query = sql.select(RETURN_FIELDS).from(TABLE).where('company_id = $1' + (includeDeleted ? '' : ' AND deactivation_ts IS NULL')).end().build();  
        return (trans ? trans.execute(query, [companyId]) : db.execute(query, [companyId]));
    };

    model.allExpiredAt = function(ts, tsFormat) {
        if(!tsFormat) {
            tsFormat = TIMESTAMP_FORMAT;
        }

        var query = 'SELECT tbl_employee.* FROM tbl_employee, tbl_company WHERE tbl_employee.company_id = tbl_company.company_id AND ' +
            'tbl_company.deactivation_ts IS NULL AND tbl_employee.deactivation_ts IS NULL AND tbl_employee.invite_accepted = TRUE AND ' +
            '(tbl_employee.last_notification_ts IS NULL OR (to_timestamp($1, $2) - tbl_employee.last_notification_ts) > tbl_company.notification_interval);';
          
        return db.execute(query, [ts, tsFormat]);
    };

    model.updateExpired = function(employeeIds, newNotificationTs, newNotificationTsFormat) {

        if(!newNotificationTsFormat) {
            newNotificationTsFormat = TIMESTAMP_FORMAT;
        }

        var query = sql.update(TABLE)
            .set('last_notification_ts = to_timestamp($1, $2)')
            .whereOr(_.map(employeeIds, function(id, i) {
                return 'tbl_employee.employee_id = $' + (i + 3);    // start at 3
            }))
            .returning(RETURN_FIELDS).end().build();
          
        return db.execute(query, [newNotificationTs, newNotificationTsFormat].concat(employeeIds));
    };
    
    model.save = function(data, trans) {

        if(!data.company_id || !data.email || !data.goals || data.goals.length <= 0) {
            throw new ex.InvalidInputDataException('employee', ['company_id', 'email', 'goals']);
        }

        var hash = crypto.randomBytes(16).toString('hex');
        
        if(data.employee_id) {
            // update
            var query = sql.update(TABLE).set(
                'email = $2',
                'goals = $3',
                'invite_accepted = (CASE WHEN deactivation_ts IS NULL THEN $4 ELSE false END)', 
                'invite_sent = (CASE WHEN deactivation_ts IS NULL THEN $5 ELSE false END)',
                'gcm_id = (CASE WHEN deactivation_ts IS NULL THEN $6 ELSE NULL END)',
                'invite_hash = (CASE WHEN deactivation_ts IS NULL THEN invite_hash ELSE $7 END)',
                'deactivation_ts = NULL',
                'last_notification_ts = (CASE WHEN deactivation_ts IS NULL THEN to_timestamp($8, \'' + TIMESTAMP_FORMAT + '\') ELSE NULL END)'
            ).where('employee_id = $1').returning(RETURN_FIELDS).end().build();
            var args = [data.employee_id, data.email.trim(), '{"' + data.goals.join('","') + '"}', data.invite_accepted, data.invite_sent, data.gcm_id, hash, data.last_notification_ts];
            
            return (trans ? trans.execute(query, args) : db.execute(query, args)).then(function(res) {
                eventTracker && eventTracker.trigger('employee.update', [res]);
                return res;
            }, function(err) {
                if(err.code == 23505) {
                    // unique/duplicate pgsql error
                    throw new ex.DuplicateRecordException('employee', data);
                }
                throw err;
            });
        }
        
        // insert
        data.registration_ts = data.last_notification_ts = datetime.getCurrentTimestamp();
        data.invite_hash = hash;

        var query = sql.insert(INSERT_FIELDS).into(TABLE).entry().returning(RETURN_FIELDS).end().build();
        var args = [data.company_id, data.email.trim(), '{"' + data.goals.join('","') + '"}', data.invite_hash, data.registration_ts, data.last_notification_ts];
        
        return (trans ? trans.execute(query, args) : db.execute(query, args)).then(function(res) {
            data.employee_id = res.rows[0].employee_id;
            eventTracker && eventTracker.trigger('employee.insert', [res]);
            return res;
        }, function(err) {
                if(err.code == 23505) {
                    // unique/duplicate pgsql error
                    throw new ex.DuplicateRecordException('employee', data);
                }
                throw err;
            });
    };

    model.replace = function(companyId, employees, trans) {
        // avoid empty data
        employees = _.reduce(employees, function(arr, employee) {
            if(!employee.email.trim() || !employee.goals || !employee.goals.join('').trim()) {
                return arr;
            }
            employee.goals = _.filter(employee.goals, function(goal) {
                return goal.trim();
            });
            arr.push(employee);
            return arr;
        }, []);

        return model.allByCompanyId(companyId, true, trans).then(function(employeeRes) {
            return {
                exists: _.reduce(employeeRes.rows, function(obj, employee) {
                    obj[employee.email] = employee;
                    return obj;
                }, {}),
                del: _.reduce(employeeRes.rows, function(arr, employee) {
                    for(var i=0; i < employees.length; i++) {
                        if(employees[i].email.trim() == employee.email) {
                            return arr;
                        }
                    }
                    arr.push(employee);
                    return arr;
                }, [])
            };
        }).then(function(data) {
            // saves 
            var savePromises = _.reduce(employees, function(arr, employee) {
                var currentEmployee = data.exists[employee.email.trim()];
                if(currentEmployee) {
                    // data exists, update
                    employee.employee_id = currentEmployee.employee_id;
                    employee.invite_accepted = currentEmployee.invite_accepted;
                    employee.invite_sent = currentEmployee.invite_sent;
                    employee.gcm_id = currentEmployee.gcm_id;
                }
                employee.company_id = companyId;
                arr.push(model.save(employee, trans));
                return arr;
            }, []);

            var delPromises = _.map(data.del, function(employee) {
                return model.delete(employee.employee_id, trans);
            });

            return Q.all(savePromises.concat(delPromises));
        }).then(function(ops) {
            return model.allByCompanyId(companyId, false, trans);
        });
    };

    model.delete = function(id, trans) {
        if(!id) {
            throw new ex.InvalidInputDataException('employee', ['employee_id']);
        }

        var query = sql.update(TABLE).set('deactivation_ts = $2').where('employee_id = $1', 'deactivation_ts IS NULL').returning(RETURN_FIELDS).end().build();
        return (trans ? trans.execute(query, [id, datetime.getCurrentTimestamp()]) : db.execute(query, [id, datetime.getCurrentTimestamp()])).then(function(res) {
            eventTracker && eventTracker.trigger('employee.delete', [res]);
            return res;
        });        
    };
    
    return model;
};
