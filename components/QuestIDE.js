import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

var QuestIDE = React.createClass({
  // Render the component
  render: function(){
    return (
      <div className="expedition-quest-ide">
        It's alive!
        <RaisedButton label="Default"/>
      </div>
    );
  }

});


module.exports = QuestIDE;