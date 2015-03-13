'use strict';

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var chalk = require('chalk');

var target = '';
var limit = 20;

var linkCheck = function (targetUrl) {
  target = targetUrl;
  console.log(chalk.underline(target));
  request(target, function (error, res, html) {
    if (error || !html) {
      console.log(chalk.red('Invalid URL!'));
      console.log(chalk.gray(error.message));
      return;
    }
    var $ = cheerio.load(html);
    var links = $('a[href]');
    if (links.length > limit) {
      console.log(chalk.gray('This page has more than %s links. Checking the first %s.'), limit, limit);
      links = links.slice(0, limit);
    }
    links.each(function () {
      var href = $(this).attr('href');
      checkAnchor(href);
    });
  });
};

var checkAnchor = function (href) {
  if (!href || href.indexOf('#') === 0) {
    return;
  }
  var requestUrl = url.resolve(target, href)
  request(requestUrl, function (error, res) {
    if (error) {
      console.log(chalk.red('NG') + ': ' + requestUrl);
      console.log(chalk.gray(error.message));
      return;
    }
    if (res.statusCode !== 200) {
      console.log(chalk.red('NG') + ': ' + requestUrl);
      console.log(chalk.gray('Status code: ' + res.statusCode));
      return;
    }
    console.log(chalk.green('OK') + ': ' + requestUrl);
  });
};

module.exports = linkCheck;
