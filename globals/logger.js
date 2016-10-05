var winston = require('winston');
var expressWinston = require('express-winston');
winston.emitErrs = true;

/*
    Global logger configuration and instances.
*/
module.exports = (function() {
    
    return {
        bot: new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: process.env.LOG_DIR || '../logs/' + (process.env.NODE_ENV == 'production' ? 'prod' : 'dev') + '-bot.log',
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, //5MB
                    maxFiles: 10,
                    colorize: false
                }),
                new winston.transports.Console({
                    level: 'debug',
                    handleExceptions: true,
                    json: false,
                    colorize: true
                })
            ],
            exitOnError: false
        }),
        storage: new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: process.env.LOG_DIR || '../logs/' + (process.env.NODE_ENV == 'production' ? 'prod' : 'dev') + '-storage.log',
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, //5MB
                    maxFiles: 10,
                    colorize: false
                }),
                new winston.transports.Console({
                    level: 'debug',
                    handleExceptions: true,
                    json: false,
                    colorize: true
                })
            ],
            exitOnError: false
        }),
        api: new winston.Logger({
            transports: [
                new winston.transports.File({
                    level: 'info',
                    filename: process.env.LOG_DIR || '../logs/' + (process.env.NODE_ENV == 'production' ? 'prod' : 'dev') + '-api.log',
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880, //5MB
                    maxFiles: 10,
                    colorize: false
                }),
                new winston.transports.Console({
                    level: 'debug',
                    handleExceptions: true,
                    json: false,
                    colorize: true
                })
            ],
            exitOnError: false
        })
    };
    
})();