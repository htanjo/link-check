'use strict';

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var chalk = require('chalk');

var target = '';

var linkCheck = function (targetUrl) {
  target = targetUrl;
  console.log(chalk.underline(target));
  request(target, function (error, res, html) {
    if (error || !html) {
      console.log(chalk.red('Invalid URL!'));
      return;
    }
    var $ = cheerio.load(html);
    var links = $('a[href]');
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
    if (!error && res.statusCode === 200) {
      console.log(chalk.green('OK') + ': ' + requestUrl);
      return;
    }
    console.log(chalk.red('NG') + ': ' + requestUrl);
  });
};

module.exports = linkCheck;
