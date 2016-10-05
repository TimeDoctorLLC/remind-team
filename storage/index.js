var companies = require('./model_company.js');
var employees = require('./model_employee.js');

var eventbus = require('./../globals/eventbus.js');
var events = eventbus.instance('storage');

var db = require('node-pg-easy')({ 
    connStr: process.env.DATABASE_URL, config: {
        max: 10,                    // connections in pool
        idleTimeoutMillis: 30000    // connection idle timeout
    } 
});

module.exports = {
    db: db,
    companies: companies(db, events),
    employees: employees(db, events),
    
    on: function(ev, cb) {
        return events.on(ev, cb);
    }
};