'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var url = require('url');
var _ = require('lodash');
var request = require('request');
var cheerio = require('cheerio');

var reporter = require('./lib/reporter');

var defaults = {
  limit: 20,
  report: false
};

var LinkCheck = function (targetUrl, options) {
  EventEmitter.call(this);

  this.target = targetUrl;
  this.options = _.merge({}, defaults, options);

  this.run();
  if (this.options.report) {
    reporter(this);
  }
};

util.inherits(LinkCheck, EventEmitter);

LinkCheck.prototype.run = function () {
  var self = this;
  setTimeout(function () {
    self.emit('start');
  }, 0);
  request(this.target, function (error, res, html) {
    if (error || !html) {
      self.emit('error', {type: 'Invalid URL', message: error.message});
      return;
    }
    var $ = cheerio.load(html);
    var links = $('a[href]');
    var limit = self.options.limit;
    if (links.length > limit) {
      self.emit('warn', 'This page has more than ' + limit + ' links. Checking the first ' + limit + '.');
      links = links.slice(0, limit);
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
  var self = this;
  var requestUrl = url.resolve(this.target, href)
  request(requestUrl, function (error, res) {
    var result = {
      url: requestUrl,
      valid: true,
      message: ''
    };
    if (error) {
      result.valid = false;
      result.message = error.message;
    }
    if (res.statusCode !== 200) {
      result.valid = false;
      result.message = 'Status code: ' + res.statusCode;
    }
    self.emit('result', result);
  });
};

module.exports = function (targetUrl, options) {
  return new LinkCheck(targetUrl, options);
};
