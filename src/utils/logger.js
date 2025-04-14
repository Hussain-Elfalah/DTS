const pino = require('pino');
const config = require('../config/config');

const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

module.exports = logger;
