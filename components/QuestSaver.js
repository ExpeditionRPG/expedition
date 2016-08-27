import React, {PropTypes} from 'react';
import timeAgo from 'time-ago';
var timeFormatter = timeAgo();

class QuestSaver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ago_interval: setInterval(this.updateAgo.bind(this), 1000),
      timeout: null,
      saving: false,
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
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.setState({timeout: null, saving: true});

    // Call into the parent to get saved data
    this.props.onSaveRequest(function() {
      this.setState({saving: false});
    }.bind(this));
  }

  updateAgo() {
    if (this.props.lastSave) {
      this.setState({last_save_text: timeFormatter.ago(this.props.lastSave)});
    }
  }


  render() {
    var styles = {
      container: {
        cursor: 'pointer',
        width: '100%',
        color: this.context.muiTheme.palette.alternateTextColor,
        backgroundColor: this.context.muiTheme.palette.canvasColor,
      },
      text: {
        float: 'right',
        marginRight: 5,
        padding: 5
      }
    };

    var text;
    // Show saving text on timeout, not on actual save.
    if (!this.state.timeout && !this.state.saving) {
      if (this.state.last_save_text) {
        text = "Last saved " + this.state.last_save_text;
      } else {
        if (!this.props.signedIn) {
          text = "Log in to save.";
        } else {
          text = "Not saved."
        }
      }
    } else {
      text = "Saving...";
    }
    // TODO: Error tooltip.
    return (
      <div style={styles.container} onTouchTap={this.save.bind(this)}><div style={styles.text}>{text}</div></div>
    )
  }
}

QuestSaver.contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

export default QuestSaver;