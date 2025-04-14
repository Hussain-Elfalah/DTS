const jwt = require('jsonwebtoken');
const config = require('../config/config');

function sessionMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    // Clear invalid token
    res.clearCookie('token');
    next();
  }
}

module.exports = sessionMiddleware;

