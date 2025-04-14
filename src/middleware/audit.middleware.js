const logger = require('../utils/logger');

function auditMiddleware(req, res, next) {
  // Log the request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    ip: req.ip
  });

  // Record response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userId: req.user?.id
    });
  });

  next();
}

module.exports = auditMiddleware;
