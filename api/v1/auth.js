var router = require('express').Router({mergeParams: true});
var bcrypt = require('bcrypt');

var storage = require('../../storage');
var utils = require('./utils.js');

router.post('/', function(req, res, next) {
    var authData;

    try {
        var accessToken = req.headers['authorization'];
        if(!accessToken || !accessToken.toLowerCase().startsWith('basic ')) {
            throw 'must start with "Bearer "';
        }
            
        authData = new Buffer(accessToken.substr(6), 'base64').toString('utf8').split(':');
        if(authData.length != 2) {
            throw 'invalid authorization';
        }
    } catch(err) {
        err.status = 401;
        next(err);
        return; 
    }

    storage.companies.getByUserEmail(authData[0]).then(function(companyRes) {
        if(companyRes && companyRes.rows && companyRes.rows.length > 0 && bcrypt.compareSync(authData[1], companyRes.rows[0].user_password)) {
            delete companyRes.rows[0].user_password;
            res.status(200).json({
                at: utils.createJwt({ company_id: companyRes.rows[0].company_id, user_email: companyRes.rows[0].user_email }),
                company: companyRes.rows[0]
            }).end(); 
        } else {
            next({ status: 401 });
        }
    }, function(err) {
        next(err);
    }).done();    
});

module.exports = router;
