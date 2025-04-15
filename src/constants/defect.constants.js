const DEFECT_TAGS = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  UI: 'UI/UX',
  DATABASE: 'Database',
  API: 'API',
  SECURITY: 'Security',
  PERFORMANCE: 'Performance',
  DOCUMENTATION: 'Documentation',
  TESTING: 'Testing',
  DEPLOYMENT: 'Deployment',
  INTEGRATION: 'Integration',
  CONFIGURATION: 'Configuration'
};

const VALID_TAGS = Object.values(DEFECT_TAGS);

module.exports = {
  DEFECT_TAGS,
  VALID_TAGS
};