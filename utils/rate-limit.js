const rateLimit = require('express-rate-limit');

exports.limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: 50,           // Max 50 requests per minute
  
  statusCode: 429,
  message: {
    success: false,
    message: "Rate limit exceeded. Pace your requests."
  },

  standardHeaders: 'draft-7', // Send standard RateLimit-* headers
  legacyHeaders: false,       // Do not send old X-RateLimit-* headers

  // Custom handler to log offenders and render a nice page
  handler: (req, res, next, options) => {
    console.warn(`IP ${req.ip} breached rate limits on ${req.originalUrl}`);
    res.status(options.statusCode).render('toomanyrequests');
  },

  // Whitelist local environment
  skip: (req) => req.ip === '127.0.0.1'
});


exports.authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: 5,           // Max 5 requests per minute
  
  statusCode: 429,
  message: {
    success: false,
    message: "Too many login attempts"
  },

  standardHeaders: 'draft-7', // Send standard RateLimit-* headers
  legacyHeaders: false,       // Do not send old X-RateLimit-* headers

  // Custom handler to log offenders and render a nice page
  handler: (req, res, next, options) => {
    console.warn(`IP ${req.ip} breached rate limits on ${req.originalUrl}`);
    res.status(options.statusCode).render('toomanyrequests');
  },

  // Whitelist local environment (handling IPv4 and IPv6)
  skip: (req) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip)
});



exports.datapostlimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  limit: 10,           // Max 10 requests per minute
  
  statusCode: 429,
  message: {
    success: false,
    message: "Too many data attempts"
  },

  standardHeaders: 'draft-7', // Send standard RateLimit-* headers
  legacyHeaders: false,       // Do not send old X-RateLimit-* headers

  // Custom handler to log offenders and render a nice page
  handler: (req, res, next, options) => {
    console.warn(`IP ${req.ip} breached rate limits on ${req.originalUrl}`);
    res.status(options.statusCode).render('toomanyrequests');
  },

  // Whitelist local environment (handling IPv4 and IPv6)
  skip: (req) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.ip)
});



