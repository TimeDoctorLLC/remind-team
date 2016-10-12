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