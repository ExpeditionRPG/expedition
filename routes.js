var React = require('react');
var fs = require('fs');

var toMarkdown = require('./translation/to_markdown');
var toXML = require('./translation/to_xml');
var toGraph = require('./translation/to_graph');
var toMeta = require('./translation/to_meta');
var model = require('./quests/model-datastore');
var cloudstorage = require('./lib/cloudstorage');
var passport = require('passport');
var oauth2 = require('./lib/oauth2');
var express =require('express');

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
var router = express.Router();
router.use(oauth2.template);

var QUESTS_FETCH_COUNT = 100;

router.get('/', function(req, res) {
  res.render('home', {
    // Pass current state to client side.
    // res.locals is set by oauth2 and includes user display info and login/out links.
    state: JSON.stringify(res.locals)
  });
});

// TODO: Abstract all these auth checks and try/catch boilerplate into middleware.

router.get('/quests/:token', function(req, res) {
  var token = req.params.token;
  if (!res.locals.profile) {
    return res.status(500).end("You are not signed in. Please sign in to view saved quests.");
  }

  model.getOwnedQuests(res.locals.profile.id, QUESTS_FETCH_COUNT, req.params.token, function(err, quests, nextToken) {
    if (err) {
      res.status(500).end(err);
    }
    result = {error: err, quests: quests, nextToken: nextToken};
    console.log("Found " + quests.length + " quests for user " + res.locals.profile.id);
    res.send(JSON.stringify(result));
  });
});

router.get('/quest/:quest', function(req, res) {
  if (!res.locals.profile) {
    res.status(500).end("You are not signed in. Please sign in to view this quest.");
  }
  model.read(res.locals.profile.id, req.params.quest, function (err, entity) {
    if (err) {
      return res.status(500).end(err.toString());
    }

    res.end(JSON.stringify(entity));
  });
});

router.post('/quest/:quest', function(req, res) {
  if (!res.locals.profile) {
    return res.status(500).end("You are not signed in. Please sign in to save your quest.");
  }

  try {
    quest = {
      meta: toMeta(req.body),
      xml: req.body,
      created: Date.now()
    };
    model.update(res.locals.profile.id, req.params.quest, quest, function(err, data) {
      if (err) {
        throw new Error(err);
      }
      console.log("Saved quest " + data.id);
      res.end(data.id.toString());
    });
  } catch(e) {
    console.log(e);
    res.status(500).end(e.toString());
  }
});

router.post('/delete/:quest', function(req, res) {
  if (!res.locals.profile) {
    res.status(500).end("You are not signed in. Please sign in to delete this quest.");
    return;
  }

  try {
    model.tombstone(res.locals.profile.id, req.params.quest, function(err) {
      if (err) {
        throw new Error(err);
      }
      console.log("Tombstoned quest " + req.params.quest);
      res.end("ok");
    });

  } catch(e) {
    console.log(e);
    res.status(500).end(e.toString());
  }
});

module.exports = router;