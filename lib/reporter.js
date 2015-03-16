'use strict';

var chalk = require('chalk');

var reporter = function (checker) {

  checker.on('start', function () {
    console.log(chalk.underline(checker.target));
  });

  checker.on('error', function (error) {
    console.log(chalk.red(error.type));
    console.log(chalk.gray(error.message));
  });

  checker.on('warn', function (message) {
    console.log(chalk.gray(message));
  });

  checker.on('result', function (result) {
    if (!result.valid) {
      console.log(chalk.red('NG') + ': ' + result.url);
      console.log(chalk.gray(result.message));
      return;
    }
    console.log(chalk.green('OK') + ': ' + result.url);
  });

};

module.exports = reporter;
