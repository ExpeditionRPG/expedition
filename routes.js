const React = require('react');
const fs = require('fs');
const querystring = require('querystring');

const config = require('./config');
const toMarkdown = require('./translation/to_markdown');
const toXML = require('./translation/to_xml');
const toGraph = require('./translation/to_graph');
const toMeta = require('./translation/to_meta');
const quests = require('./models/quest');
const passport = require('passport');
const oauth2 = require('./lib/oauth2');
const express = require('express');

// TODO: Rate limit all routers
// TODO: SSL
// TODO: Abstract all these auth checks and try/catch boilerplate into middleware.
// Idea: use a validation library like Joi to validate params
// TODO: Lock down CORS

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
const router = express.Router();
router.use(oauth2.template);


router.get('/', function(req, res) {
  res.render('app', {
    state: JSON.stringify(res.locals),
  });
});


router.post('/quests', function(req, res) {

  const token = req.params.token;
  if (!res.locals.id) {
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.send(JSON.stringify([]));
  }

  try {
    const params = JSON.parse(req.body);
    quests.search(res.locals.id, params, function(err, quests, nextToken) {
      if (err) {
        res.header('Access-Control-Allow-Origin', req.get('origin'));
        res.header('Access-Control-Allow-Credentials', 'true');
        console.log(err);
        return res.status(500).end("Search Error");
      }
      result = {error: err, quests: quests, nextToken: nextToken};
      console.log("Found " + quests.length + " quests for user " + res.locals.id);
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Allow-Credentials', 'true');
      res.send(JSON.stringify(result));
    });
  } catch (e) {
    console.log(e);
    return res.status(500).end("Search Error");
  }
});


router.get('/raw/:quest', function(req, res) {
  quests.getById(req.params.quest, function(err, entity) {
    if (err) {
      return res.status(500).end(err.toString());
    }
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Content-Type', 'text/xml');
    res.header('Location', entity.url);
    res.status(301).end();
  });
});


router.post('/publish/:quest', function(req, res) {

  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in to save your quest.");
  }

  try {
    quests.publish(res.locals.id, req.params.quest, req.body, function(err, id) {
      if (err) {
        throw new Error(err);
      }
      console.log("Published quest " + id);
      res.end(id);
    });
  } catch(e) {
    console.log(e);
    res.status(500).end(e.toString());
  }
});


router.post('/unpublish/:quest', function(req, res) {

  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in to save your quest.");
  }

  try {
    quests.unpublish(res.locals.id, req.params.quest, function(err, id) {
      if (err) {
        throw new Error(err);
      }
      console.log("Unpublished quest " + id);
      res.end(id.toString());
    });
  } catch(e) {
    console.log(e);
    res.status(500).end(e.toString());
  }
});


module.exports = router;
