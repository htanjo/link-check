'use strict';

var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var chalk = require('chalk');

var LinkCheck = function (targetUrl) {
  var self = this;
  this.target = targetUrl;
  this.limit = 20;
  console.log(chalk.underline(this.target));
  request(this.target, function (error, res, html) {
    if (error || !html) {
      console.log(chalk.red('Invalid URL!'));
      console.log(chalk.gray(error.message));
      return;
    }
    var $ = cheerio.load(html);
    var links = $('a[href]');
    if (links.length > self.limit) {
      console.log(chalk.gray('This page has more than %s links. Checking the first %s.'), self.limit, self.limit);
      links = links.slice(0, self.limit);
    }
    links.each(function () {
      var href = $(this).attr('href');
      self.checkAnchor(href);
    });
  });
};

LinkCheck.prototype.checkAnchor = function (href) {
  if (!href || href.indexOf('#') === 0) {
    return;
  }
  var requestUrl = url.resolve(this.target, href)
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

module.exports = function (targetUrl) {
  return new LinkCheck(targetUrl);
};
