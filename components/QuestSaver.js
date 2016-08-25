import React from 'react';
import timeAgo from 'time-ago';
var timeFormatter = timeAgo();

export default class QuestSaver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ago_interval: setInterval(this.updateAgo.bind(this), 10000),
      timeout: null,
      saving: false,
      last_save_ts: null,
      last_save_text: null,
    };

    // TODO: Preload last_save when prop is set.
  }

  markDirty() {
    if (!this.props.signedIn) {
      return;
    }
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    setTimeout(this.state.timeout, this.save);
    this.setState({timeout: timeout});
  }

  save() {
    if (!this.props.signedIn) {
      return;
    }
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.setState({timeout: null, saving: true});

    // Call into the parent to get saved data
    var xml = this.props.onQuestStateRequest();

    if (xml === undefined) {
      // TODO set proper state here. Happens when translation fails.
      return;
    }
    $.post("/quest/" + this.props.id, xml, function(result_quest_id) {
      this.props.onQuestIdChange(result_quest_id);
      this.setState({saving: false, last_save_ts: Date.now()});
      this.updateAgo();
    }.bind(this)).fail(function(err) {
      this.setState({saving: false, error: err.statusText + " (" + err.status + "): " + err.responseText});
      this.props.onHTTPError(err);
    }.bind(this));

    // TODO: Check if dirtied while we were saving.
  }

  updateAgo() {
    if (this.state.last_save_ts) {
      this.setState({last_save_text: timeFormatter.ago(this.state.last_save_ts)});
    }
  }


  render() {
    var text;
    // Show saving text on timeout, not on actual save.
    if (!this.state.timeout) {
      if (this.state.last_save_text) {
        text = "Last saved " + this.state.last_save_text;
      } else {
        if (!this.props.signedIn) {
          text = "Log in to save.";
        } else {
          text = "Not yet saved."
        }
      }
    } else {
      text = "Saving...";
    }
    // TODO: Error tooltip.
    return (
      <span style={{cursor: 'pointer'}} onTouchTap={this.save.bind(this)}>{text}</span>
    )
  }
}