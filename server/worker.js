// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// Activate Google Cloud Trace and Debug when in production
if (process.env.NODE_ENV === 'production') {
  require('@google/cloud-trace').start();
  require('@google/cloud-debug');
}

var request = require('request');
var waterfall = require('async').waterfall;
var express = require('express');
var config = require('./config');

var logging = require('./lib/logging');
var images = require('./lib/images');
var background = require('./lib/background');

var model = require('./quests/model-datastore');

// When running on Google App Engine Managed VMs, the worker needs
// to respond to HTTP requests and can optionally supply a health check.
// [START server]
var app = express();

app.use(logging.requestLogger);

app.get('/_ah/health', function (req, res) {
  res.status(200).send('ok');
});

// Keep count of how many requests this worker has processed
var requestCount = 0;
app.get('/', function (req, res) {
  res.send('This worker has processed ' + requestCount + ' requests.');
});

app.use(logging.errorLogger);

if (module === require.main) {
  var server = app.listen(config.get('PORT'), function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}
// [END server]

function subscribe () {
  var unsubscribeFn = background.subscribe(function (err, message) {
    // Any errors received are considered fatal.
    if (err) {
      throw err;
    }
    if (message.action === 'toMarkdown') {
      /*
      try {
        res.end(toXML(req.body), 'utf-8');
      } catch (e) {
        console.log(e);
        serverError(res, 500, e);
      }
      */
      logging.info('Convert to markdown: ' + message.bookId);
      processBook(message.bookId);
    } else if (message.action === 'toXML') {
      /*
      try {
        res.end(toMarkdown(req.body), 'utf-8');
      } catch (e) {
        console.log(e);
        serverError(res, 500, e);
      }
      */
      logging.info('Convert to XML: ' + message.bookID)
    } else {
      logging.warn('Unknown request', message);
    }
  });
  return unsubscribeFn;
}

if (module === require.main) {
  subscribe();
}

function processBook (bookId, callback) {
  if (!callback) {
    callback = logging.error;
  }
  /*
  waterfall([
    // Load the current data
    function (cb) {
      model.read(bookId, cb);
    },
    // Find the information from Google
    findBookInfo,
    // Save the updated data
    function (updated, cb) {
      model.update(updated.id, updated, false, cb);
    }
  ], function (err) {
    if (err) {
      logging.error('Error occurred', err);
      return callback(err);
    }
    logging.info('Updated book ' + bookId);
    requestCount += 1;
    callback();
  });
  */
  callback("TODO: Implement quest processing");
}

exports.app = app;
exports.subscribe = subscribe;
exports.processBook = processBook;
