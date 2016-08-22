var JSX = require('babel-core/register')({
  presets: ['es2015', 'react']
});
var React = require('react');
var fs = require('fs');

var toMarkdown = require('./translation/to_markdown');
var toXML = require('./translation/to_xml');
var toGraph = require('./translation/to_graph');
var model = require('./quests/model-datastore');
var cloudstorage = require('./lib/cloudstorage');

module.exports = {

  index: function(req, res) {
    //var markup = React.renderComponentToString(
    //  QuestIDE({})
    //);

    fs.readFile('translation/examples/oust_albanus.md', 'utf8', function(err, mddata) {
      fs.readFile('translation/examples/oust_albanus.xml', 'utf8', function(err, xmldata) {
        // Render our 'home' template
        res.render('home', {
          state: JSON.stringify({
            markdown: mddata,
            xml: xmldata
          }) // Pass current state to client side
        });
      });
    });
  },

  page: function(req, res) {
    // Render as JSON
    res.send({hello: "world"});
  },

  getQuest: function(req, res) {
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
  },

  updateQuest: function(req, res) {
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

    if (req.params.intype === 'xml' && req.params.outtype === 'md') {
      res.end(toMarkdown(req.body));
    } else if (req.params.intype === 'md' && req.params.outtype === 'xml') {
      res.end(toXML(req.body));
    } else if (req.params.intype === 'xml' && req.params.outtype === 'graph') {
      res.end(toGraph(req.body));
    } else {
      res.end('ERR INVALID');
    };
  }
}