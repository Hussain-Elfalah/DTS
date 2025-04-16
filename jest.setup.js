// Global setup for Jest tests

// Increase default timeout for tests
jest.setTimeout(10000);

// Mock the database connection (src/config/database.js)
jest.mock('./src/config/database', () => {
  const mockKnex = jest.fn();
  
  // Add methods used in tests
  mockKnex.transaction = jest.fn();
  mockKnex.raw = jest.fn().mockResolvedValue({});
  mockKnex.schema = {
    hasTable: jest.fn().mockResolvedValue(true)
  };
  mockKnex.destroy = jest.fn().mockResolvedValue(undefined);
  
  return mockKnex;
});

// Make sure process exits properly even if something is still listening
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Exiting gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting gracefully...');
  process.exit(0);
});

// Global teardown
afterAll(() => {
  // Add any cleanup needed
  jest.resetModules();
}); 