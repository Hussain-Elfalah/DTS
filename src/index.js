require('events').EventEmitter.defaultMaxListeners = 15;

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const config = require('./config/config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const auditMiddleware = require('./middleware/audit.middleware');
const sessionMiddleware = require('./middleware/session.middleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.security.cors));
app.use(rateLimit(config.security.rateLimit));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session management
app.use(sessionMiddleware);

// Audit logging
app.use(auditMiddleware);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/defects', require('./routes/defect.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

module.exports = app;


