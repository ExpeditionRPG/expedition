var JSX = require('babel-core/register')({
  presets: ['es2015', 'react']
});
var React = require('react');
var fs = require('fs');


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

  toMarkdown: function(req, res) {
    try {
      res.end(toMarkdown(req.body), 'utf-8');
    } catch (e) {
      console.log(e);
      res.end(500);
    }
  },

  toXML: function(req, res) {
    try {
      res.end(toXML(req.body), 'utf-8');
    } catch (e) {
      console.log(e);
      res.end(500);
    }
  }
}