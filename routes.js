var React = require('react');
var fs = require('fs');

var toMarkdown = require('./translation/to_markdown');
var toXML = require('./translation/to_xml');
var toGraph = require('./translation/to_graph');
var toMeta = require('./translation/to_meta');
var model = require('./quests/model');
var passport = require('passport');
var oauth2 = require('./lib/oauth2');
var express =require('express');

// TODO: Rate limit all routers
// TODO: SSL

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
var router = express.Router();
router.use(oauth2.template);

var ALLOWED_CORS = "http://localhost:5000";

router.get('/', function(req, res) {
  res.render('home', {
    // Pass current state to client side.
    // res.locals is set by oauth2 and includes user display info.
    state: JSON.stringify(res.locals)
  });
});

// TODO: Abstract all these auth checks and try/catch boilerplate into middleware.

router.post('/quests', function(req, res) {
  var token = req.params.token;
  if (!res.locals.id) {
    res.header('Access-Control-Allow-Origin', ALLOWED_CORS);
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.send(JSON.stringify([]));
  }

  var params;
  try {
    params = JSON.parse(req.body);
  } catch (e) {
    console.log(e);
    return res.status(500).end("Search Error");
  }

  model.searchQuests(res.locals.id, params, function(err, quests, nextToken) {
    if (err) {
      res.header('Access-Control-Allow-Origin', ALLOWED_CORS);
      console.log(err);
      return res.status(500).end("Search Error");
    }
    result = {error: err, quests: quests, nextToken: nextToken};
    console.log("Found " + quests.length + " quests for user " + res.locals.id);
    res.header('Access-Control-Allow-Origin', ALLOWED_CORS);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.send(JSON.stringify(result));
  });
});

router.get('/quest/:quest', function(req, res) {
  if (!res.locals.id) {
    res.status(500).end("You are not signed in. Please sign in to view this quest.");
  }
  model.read(res.locals.id, req.params.quest, function (err, entity) {
    if (err) {
      return res.status(500).end(err.toString());
    }
    res.end(JSON.stringify(entity));
  });
});

router.get('/raw/:quest', function(req, res) {
  model.read(null, req.params.quest, function(err, entity) {
    if (err) {
      return res.status(500).end(err.toString());
    }
    res.header('Access-Control-Allow-Origin', ALLOWED_CORS);
    res.header('Content-Type', 'text/xml');
    res.header('Location', entity.url);
    res.status(301).end();
  });
});

router.post('/published/:quest/:published', function(req, res) {
  if (!res.locals.id) {
    res.status(500).end("You are not signed in. Please sign in to publish/unpublish this quest.");
  }
  model.publish(res.locals.id, req.params.quest, req.params.published, function(err, shortUrl) {
    if (err) {
      return res.status(500).end(err.toString());
    }
    res.end(shortUrl);
  });
});

router.post('/quest/:quest', function(req, res) {
  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in to save your quest.");
  }

  try {
    quest = toMeta(req.body);
    quest.created = Date.now();

    model.update(res.locals.id, req.params.quest, quest, req.body, function(err, id) {
      if (err) {
        throw new Error(err);
      }
      console.log("Saved quest " + id);
      res.end(id.toString());
    });
  } catch(e) {
    console.log(e);
    res.status(500).end(e.toString());
  }
});

router.post('/delete/:quest', function(req, res) {
  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in to delete this quest.");
  }

  if (!req.params.quest) {
    return res.status(500).end("No quest ID given for deletion.");
  }

  try {
    model.tombstone(res.locals.id, req.params.quest, function(err) {
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