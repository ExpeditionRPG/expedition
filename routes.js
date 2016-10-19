var React = require('react');
var fs = require('fs');
var querystring = require('querystring');

var config = require('./config');
var toMarkdown = require('./translation/to_markdown');
var toXML = require('./translation/to_xml');
var toGraph = require('./translation/to_graph');
var toMeta = require('./translation/to_meta');
var model = require('./quests/model');
var passport = require('passport');
var oauth2 = require('./lib/oauth2');
var express = require('express');

// TODO: Rate limit all routers
// TODO: SSL

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
var router = express.Router();
router.use(oauth2.template);

var ALLOWED_CORS = "http://semartin.local:5000";

function isAuthenticated(req, res, next) {
  if (req.user != null)
    return next();
  res.redirect('/');
}


router.get('/', function(req, res) {

// console.log(req)

  if (req.user != null) {
    return res.redirect('/app');
  }

// res.render('app', {
//   // Pass current state to client side.
//   // res.locals is set by oauth2 and includes user display info.
//   state: JSON.stringify(res.locals),
// });
  res.render('splash', {});
});

router.get('/app', isAuthenticated, function(req, res) {
  res.render('app', {
    // Pass current state to client side.
    // res.locals is set by oauth2 and includes user display info.
    state: JSON.stringify(res.locals),
  });
});

router.get('/login', function(req, res) {
  var params = querystring.stringify({
    response_type: 'token',
    client_id: config.get('OAUTH2_CLIENT_ID'),
    redirect_uri: 'http://localhost:8080/auth/google/callback',
    scope: 'profile',
    include_granted_scopes: true,
  });
  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params);
});


router.get('/auth/google/callback', function(req, res) {
  res.redirect('/');
});


// TODO: Abstract all these auth checks and try/catch boilerplate into middleware.
// Idea: use a validation library like Joi to validate params

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
      res.header('Access-Control-Allow-Credentials', 'true');
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

router.post('/share/:quest/:share', function(req, res) {
  if (!res.locals.id) {
    res.status(500).end("You are not signed in. Please sign in to share this quest.");
  }
  model.share(res.locals.id, req.params.quest, req.params.share, function(err, shortUrl) {
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
    quest = toMeta.fromMarkdown(req.body);
    quest.created = Date.now();
    console.log(quest);

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

router.post('/publish/:quest', function(req, res) {
  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in to save your quest.");
  }

  try {
    quest = toMeta.fromXML(req.body);
    quest.created = Date.now();
    console.log(quest);

    model.publish(res.locals.id, req.params.quest, quest, req.body, function(err, id) {
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