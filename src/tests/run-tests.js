/**
 * Simple script to run all tests in the tests directory
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running all tests...');

// Get all test files in the current directory
const testsDir = __dirname;
const testFiles = fs.readdirSync(testsDir)
  .filter(file => file.endsWith('.test.js'));

// Exit with error code if no test files found
if (testFiles.length === 0) {
  console.error('No test files found!');
  process.exit(1);
}

// Print out the test files that will be run
console.log(`Found ${testFiles.length} test files:`);
testFiles.forEach(file => console.log(`- ${file}`));
console.log('\n');

// Run the tests using Jest
try {
  // Create a command that runs all the test files
  const testFilePaths = testFiles
    .map(file => path.join(testsDir, file))
    .join(' ');
  
  execSync(`npx jest ${testFilePaths} --verbose`, { stdio: 'inherit' });
  console.log('\nAll tests completed successfully!');
} catch (error) {
  console.error('\nSome tests failed!');
  process.exit(1);
} 