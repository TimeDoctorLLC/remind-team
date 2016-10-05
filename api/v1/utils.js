var jwt = require('jwt-simple');
var storage = require('../../storage');

module.exports = (function() {
    if(!process.env.JWT_SECRET) {
        console.error('Must set environment variable JWT_SECRET!');
        process.exit(1);
    }
    
    var JWT_SECRET = process.env.JWT_SECRET;
    
    var utils = {};

    utils.JWT_SECRET = JWT_SECRET;
    
    utils.createJwt = function(payload) {
        payload.expires = new Date().getTime() + 86400000; // 1 day
        return jwt.encode(payload, JWT_SECRET);
    };

    utils.decodeJwt = function(token) {
        return jwt.decode(token, JWT_SECRET);
    };

    utils.mws = {};     // middlewares
    
    // middleware that enforces the specified content type
    utils.mws.inputEnforcer = function(ct) {
        return function(req, res, next) {
            var requestType = req.get('Content-Type');
            if(requestType !== ct) {
                next({ status: 406 });
                return;
            }
            next();
        };
    };

    utils.mws.jsonInputEnforcer = utils.mws.inputEnforcer('application/json');
    
    // checks if the JWT is valid and retrieves the associated team
    utils.mws.jwtEnforcer = function(companyExtras, includeDisabled) {
        return function(req, res, next) {
            var data = {};
            var currentTime = new Date().getTime();
            
            try {
                var accessToken = req.headers['authorization'];
                if(accessToken.toLowerCase().startsWith('bearer ')) {
                    // if 'Bearer' check for a JWT
                    accessToken = accessToken.substr(7);
                    data = jwt.decode(accessToken, JWT_SECRET);
                } else {
                    throw 'must start with "Bearer "';
                }
            } catch(err) {
                err.status = 401;
                next(err);
                return; 
            }
            
            // check if JWT is expired
            if(data.expires < currentTime) {
                next({ status: 401, message: 'expired' });
                return;
            }
                        
            storage.companies.get(data.company_id, includeDisabled, companyExtras).then(function(res) {
                if(!res || !res.rows || res.rows.length <= 0) {
                    next({ status: 401, message: 'company not found' });
                    return;
                }

                req.company = res.rows[0];
                                
                next();
            }, function(err) {
                next(err);
            }).done();
        };
    };
    
    return utils;
})();
