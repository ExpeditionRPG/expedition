import React, {PropTypes} from 'react';
import timeAgo from 'time-ago';
var timeFormatter = timeAgo();

class QuestSaver extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ago_interval: setInterval(this.updateAgo.bind(this), 60000),
      timeout: null,
      saving: false,
      last_save_text: null,
    };

    // TODO: Preload last_save when prop is set.
  }

  componentWillUnmount() {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
      clearInterval(this.state.ago_interval);
    }
  }

  componentWillReceiveProps(new_props) {
    if (new_props.lastSave !== this.props.lastSave) {
      this.updateAgo(new_props.lastSave);
    }
  }

  markDirty() {
    if (!this.props.signedIn) {
      return;
    }
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.setState({timeout: setTimeout(this.save.bind(this), 5000)});
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

  updateAgo(lastSave) {
    if (!lastSave) {
      lastSave = this.props.lastSave;
    }
    if (lastSave) {
      this.setState({last_save_text: timeFormatter.ago(lastSave)});
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

/*<QuestSaver
id={id}
signedIn={auth.profile}
lastSave={meta.last_save}
ref={(s) => this.saver = s}
onSaveRequest={this.saveQuest.bind(this)}/>
*/

export default QuestSaver;