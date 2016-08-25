import React from 'react';
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';

export default class QuestList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      quests: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
      console.log("Fetching");
      // TODO: Actually use tokens
      $.get("/quests/0", function(result) {
        this.setState(JSON.parse(result));
      }.bind(this)).fail(function(err) {
        this.setState({error: err});
        this.props.onHTTPError(err);
      }.bind(this));
    }
  }

  render() {
    var body;
    if (this.state.error) {
      body = <div>{this.state.error}</div>;
    } else if (this.state.quests === null) {
      body = <CircularProgress />;
    } else if (this.state.quests.length === 0) {
      body = <div>No saved quests.</div>
    } else {
      var menu = [];
      for (var i = 0; i < this.state.quests.length; i++) {
        var id = this.state.quests[i].id;
        menu.push(<MenuItem key={i} value={id}>
          <div>{this.state.quests[i].meta.title}</div>
          <div>{this.state.quests[i].meta.summary}</div>
          <div>{id}</div>
        </MenuItem>);
      }
      body = <span>
        <h1>{this.state.quests.length} Saved Quests</h1>
        <Menu onChange={(event, value) => this.props.onQuestSelect(value)} >{menu}</Menu>
      </span>;
    }

    return (
      <Drawer docked={false} onRequestChange={this.props.onRequestChange} open={this.props.open}>{body}</Drawer>
    )
  }
}

