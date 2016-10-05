var Q = require('q');
var _ = require('underscore');
var validator = require('validator');

var pg = require('node-pg-easy');
var sql = require('node-pg-sqlbuilder');

var datetime = require('../globals/datetime.js');

var employees = require('./model_employee.js');

module.exports = {
    DuplicateRecordException: function(entity, data) {
        this.status = 409;
        this.entity = entity;
        this.data = data;
    },
    InvalidInputDataException: function(entity, fields) {
        this.status = 400;
        this.entity = entity;
        this.fields = fields;
        this.toString = function() {
            return 'Invalid ' + this.entity + '. Must supply a valid ' + this.fields.join(', ');
        };
    }
};