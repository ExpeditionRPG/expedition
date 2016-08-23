var React = require('react');
var fs = require('fs');

var toMarkdown = require('./translation/to_markdown');
var toXML = require('./translation/to_xml');
var toGraph = require('./translation/to_graph');
var model = require('./quests/model-datastore');
var cloudstorage = require('./lib/cloudstorage');
var passport = require('passport');
var oauth2 = require('./lib/oauth2');
var express =require('express');

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
var router = express.Router();
router.use(oauth2.template);

router.get('/', function(req, res) {
  res.render('home', {
    // Pass current state to client side.
    // res.locals is set by oauth2 and includes user display info and login/out links.
    state: JSON.stringify(res.locals)
  });
});

router.get('/quest/:quest/:type', function(req, res) {
  model.read(req.params.quest, function (err, entity) {
    if (err) {
      res.end(500);
      return;
    }

    if (req.params.type && ['xml', 'markdown', 'graph'].indexOf(req.params.type) !== -1) {
      res.send(entity['type']);
    } else {
      res.send(entity);
    }
  });
});

router.post('/quest/:quest/:intype/:outtype', function(req, res) {
  // Convert the passed data to the remaining types (xml, md, graph)
  // and save the datas.

  var quest = {
    id: req.params.quest,
  }

  // TODO: User quota check
  if (req.params.intype === req.params.outtype) {
    res.end('ERR SAME TYPE');
    return;
  }

  try {
    if (req.params.intype === 'xml' && req.params.outtype === 'md') {
      res.end(toMarkdown(req.body));
    } else if (req.params.intype === 'md' && req.params.outtype === 'xml') {
      res.end(toXML(req.body));
    } else if (req.params.intype === 'xml' && req.params.outtype === 'graph') {
      res.end(toGraph(req.body));
    } else if (req.params.intype === 'md' && req.params.outtype === 'graph') {
      res.end(toGraph(toXML(req.body)));
    } else {
      throw new Error("Invalid translation from " + req.params.intype + " to " + req.params.outtype);
    };
  } catch (e) {
    res.status(500).end(e.toString());
  }
});

module.exports = router;