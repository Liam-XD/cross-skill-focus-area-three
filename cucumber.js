//This file configures Cucumber to run TypeScript step definitions and output test results in progress and HTML formats.

module.exports = {
  default: {
  require: ['features/steps/**/*.ts', 'features/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:reports/cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' },
    tags: 'not @skip' // Exclude scenarios tagged with @skip
  }
};