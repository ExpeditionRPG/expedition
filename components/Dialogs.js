import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

/*
<IconMenu
            iconButtonElement={<Avatar src={this.state.auth.profile.image} />}
            anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            onChange={this.handleMenu.bind(this)}>
            <MenuItem value="help" primaryText="Help" />
            <Divider />
            <MenuItem value="sign_out" primaryText={"Sign Out"} />
          </IconMenu>
          */

class YesNoDialog extends React.Component {
  constructor(props) {
    super(props)
    this.title = "";
  }

  render() {
    var actions = [
      <RaisedButton
        label="Yes"
        primary={true}
        onTouchTap={() => this.props.onRequestClose(true)}
      />,
      <RaisedButton
        label="No"
        primary={true}
        onTouchTap={() => this.props.onRequestClose(false)}
      />,
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={() => this.props.onRequestClose(null)}
      />
    ];
    return (
      <Dialog
        title={this.title}
        actions={actions}
        modal={false}
        open={Boolean(this.props.open)}
        onRequestClose={this.props.onRequestClose}
        />
    );
  }
}

export class ConfirmNewQuestDialog extends YesNoDialog {
  constructor(props) {
    super(props)
    this.title = "Save changes before creating new quest?";
  }
}

export class ConfirmLoadQuestDialog extends YesNoDialog {
  constructor(props) {
    super(props)
    this.title = "Save changes before loading new quest?";
  }
}



export class UserDialog extends React.Component {
  render() {
    var signed_in = Boolean(this.props.auth.profile);
    var title;
    var actions = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.props.onRequestClose}
      />,
    ];

    if (signed_in) {
      title = "Signed In As " + this.props.auth.profile.displayName;
      actions.push(
        <RaisedButton
          label="Sign Out"
          primary={true}
          onTouchTap={() => window.location = this.props.auth.logout}
        />);
    } else {
      title = "Not Signed In";
      actions.push(
        <RaisedButton
          label="Sign In"
          primary={true}
          onTouchTap={() => window.location = this.props.auth.login}
        />);
    }

    return (
      <Dialog
        title={title}
        actions={actions}
        modal={false}
        open={Boolean(this.props.open)}
        onRequestClose={this.props.onRequestClose}
        >
      </Dialog>
    );
  }
}