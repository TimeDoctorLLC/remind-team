var debug = require('debug')('web-mailer');

var Q = require('q');
var _ = require('underscore');

var fs = require('fs');
var format = require('string-template');
var compile = require('string-template/compile');

var nodemailer = require('nodemailer');
var sendmailTransport = require('nodemailer-sendmail-transport');

var logger = require('../../globals/logger.js').api;
var transporter = nodemailer.createTransport(sendmailTransport(process.env.SENDMAIL_PATH ? {
    path: process.env.SENDMAIL_PATH
} : null));

var ORIGIN = process.env.DU_ORIGIN || 'https://www.goalreminder.com';
var WELCOME_FROM = process.env.MAIL_SENDER || 'support@goalreminder.com';
var WELCOME_SUBJECT = 'Goal Reminder is Ready';

var templates = {};

function loadTemplate(filename, cb) {
    if(templates[filename]) {
        cb(null, templates[filename]);
        return;
    }

    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            return cb(err, null);
        }
        templates[filename] = compile(data);
        cb(null, templates[filename]);
    });
}

function renderFile(filename, data, options) {
    var deferred = Q.defer();

    loadTemplate(filename, function(err, format) {
        if(err) {
            deferred.reject(err);
            return;
        }
        deferred.resolve(format(data));
    });

    return deferred.promise;
}

var mailer = {};

mailer.sendWelcome = function(company) {
    return renderFile('./api/v1/templates/mail_welcome.html', { user_name: company.user_name, origin: ORIGIN }).then(function(html) {
        return transporter.sendMail({
            to: '"' + company.user_name + '" <' + company.user_email + '>',
            from: WELCOME_FROM,
            subject: WELCOME_SUBJECT,
            html: html
        });
    });
};

mailer.sendInvite = function(company, email, code) {
    return renderFile('./api/v1/templates/mail_invite.html', { code: code, origin: ORIGIN }).then(function(html) {
        return transporter.sendMail({
            to: email,
            from: WELCOME_FROM,
            subject: company.user_name + ' has invited you to Goal Reminder',
            html: html
        });
    });
}

module.exports = mailer;