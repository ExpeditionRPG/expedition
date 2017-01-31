const express = require('express');
const fs = require('fs');
const passport = require('passport');
const querystring = require('querystring');
const React = require('react');

const config = require('./config');
const toMarkdown = require('./translation/to_markdown');
const toXML = require('./translation/to_xml');
const toGraph = require('./translation/to_graph');
const toMeta = require('./translation/to_meta');
const quests = require('./models/quest');
const Mail = require('./mail');
const oauth2 = require('./lib/oauth2');


// TODO: Rate limit all routes
// TODO: SSL
// TODO: Abstract all these auth checks into middleware.
    // aka find a good existing auth middleware
        // note that auth and how its passed seems to vary between quest creator and app
// TODO: abstract status: 500 try / catches
// TODO: Lock down CORS
// TODO: use a validation library like Joi to validate params

// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
const router = express.Router();
router.use(oauth2.template);

router.get('/', (req, res) => {
  res.render('app', {
    state: JSON.stringify(res.locals),
  });
});


const HTML_REGEX = /<(\w|(\/\w))(.|\n)*?>/igm;
// TODO validate with hapi: require title, author_name, author_email (valid email), feedback, players, difficulty
router.post('/feedback', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.get('origin'));
  const params = JSON.parse(req.body);
  // strip all HTML tags for protection, then replace newlines with br's
  const title = params.title.replace(HTML_REGEX, '');
  const htmlFeedback = params.feedback.replace(HTML_REGEX, '').replace(/(?:\r\n|\r|\n)/g, '<br/>');
  const htmlMessage = `<p>Some adventurers have sent you feedback on your quest, ${title}. Hooray!</p>
  <p>They played with ${params.players} adventurers on ${params.difficulty} difficulty.</p>
  <p>Their feedback:</p>
  <p>${htmlFeedback}</p>
  <p>If you have any questions about the quest creator, or run into any bugs, you can email <a href="mailto:Expedition@Fabricate.io">Expedition@Fabricate.io</a></p>
  <p>Happy Adventuring!</p>
  <p>Todd & Scott</p>`;
  // turn end of paragraphs into double newlines
  const textMessage = htmlMessage.replace(/<\/p>/g, '\r\n\r\n').replace(HTML_REGEX, '');

  Mail.send(params.authorEmail, 'Feedback on your Expedition quest: ' + params, textMessage, htmlMessage, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err);
    } else {
      return res.send(result.response);
    }
  });
});


router.post('/quests', (req, res) => {
  try {
    const token = req.params.token;
    if (!res.locals.id) {
      res.header('Access-Control-Allow-Origin', req.get('origin'));
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.send(JSON.stringify([]));
    }

    const params = req.body;
    quests.search(res.locals.id, params, (err, quests, nextToken) => {
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


router.get('/raw/:quest', (req, res) => {
  quests.getById(req.params.quest, (err, entity) => {
    if (err) {
      return res.status(500).end(err.toString());
    }
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Content-Type', 'text/xml');
    res.header('Location', entity.url);
    res.status(301).end();
  });
});


router.post('/publish/:quest', (req, res) => {

  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in (by refreshing the page) to save your quest.");
  }

  try {
    quests.publish(res.locals.id, req.params.quest, req.body, (err, id) => {
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


router.post('/unpublish/:quest', (req, res) => {

  if (!res.locals.id) {
    return res.status(500).end("You are not signed in. Please sign in (by refreshing the page) to save your quest.");
  }

  try {
    quests.unpublish(res.locals.id, req.params.quest, (err, id) => {
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
