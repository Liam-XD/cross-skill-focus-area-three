//This file configures Cucumber to run TypeScript step definitions and output test results in progress and HTML formats.

module.exports = {
  default: {
  require: ['features/steps/**/*.ts', 'features/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress', 'html:cucumber-report.html'],
    formatOptions: { snippetInterface: 'async-await' }
  }
};