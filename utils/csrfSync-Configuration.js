const { csrfSync } = require('csrf-sync');


const csrf_configuration_object = {

    //extracting the csrf token from the request
    getTokenFromRequest: (req) => req.body._csrf,
    
    // Custom error handling
    invalidTokenStatusCode: 401,
    invalidTokenMessage: "Security verification failed. Please refresh.",
    

    // Custom bypass logic
    // skip: (req) => req.path === '/api/stripe-webhook',
    //  ignoredMethods : [GET,HEAD,OPTIONS]
    
    // Custom storage logic
    // storeTokenInState: (req, token) => { req.userContext.csrfSecret = token; },
    // getTokenFromState: (req) => { return req.userContext.csrfSecret; }

    //Crrptography Algorithm Configuration
    // size :128

} ;


const {generateToken,csrfSynchronisedProtection} = csrfSync(csrf_configuration_object); 

exports.generateToken = generateToken;
exports.csrfSynchronisedProtection = csrfSynchronisedProtection;


