var JSX = require('babel-core/register')({
  presets: ['es2015', 'react']
});
var React = require('react');
var QuestIDE = require('./components/QuestIDE');

module.exports = {

  index: function(req, res) {
    //var markup = React.renderComponentToString(
    //  QuestIDE({})
    //);

    // Render our 'home' template
    res.render('home', {
      state: JSON.stringify({test: "hello world"}) // Pass current state to client side
    });

  },

  page: function(req, res) {
    // Render as JSON
    res.send({hello: "world"});
  }

}