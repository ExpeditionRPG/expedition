import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {DialogIDs} from './actions';

// TODO: <MenuItem value="help" primaryText="Help" />
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

class ConfirmNewQuestDialog extends YesNoDialog {
  constructor(props) {
    super(props)
    this.title = "Save changes before creating new quest?";
  }
}

class ConfirmLoadQuestDialog extends YesNoDialog {
  constructor(props) {
    super(props)
    this.title = "Save changes before loading new quest?";
  }
}

class PublishQuestDialog extends React.Component {
  render() {
    return (
      <Dialog
        title="Published!"
        actions={<RaisedButton
          label="Sign In"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />}
        modal={false}
        open={Boolean(this.props.open)}>
        Your quest has been published. You can access it at: <a href={this.props.shortUrl}>{this.props.shortUrl}</a>
      </Dialog>
    );
  }
}

class UserDialog extends React.Component {
  render() {
    var signed_in = Boolean(this.props.userName);
    var title;
    var actions = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.props.onRequestClose}
      />,
    ];

    if (signed_in) {
      title = "Signed In As " + this.props.userName;
      actions.push(
        <RaisedButton
          label="Sign Out"
          primary={true}
          onTouchTap={() => window.location = this.props.user.logout}
        />);
    } else {
      title = "Not Signed In";
      actions.push(
        <RaisedButton
          label="Sign In"
          primary={true}
          onTouchTap={() => window.location = this.props.user.login}
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

const Dialogs = ({open, user_name, short_url, onRequestClose}) => {
  console.log(open);
  return (
    <span>
      <UserDialog
        open={open[DialogIDs.USER]}
        userName={user_name}
        onRequestClose={(choice) => onRequestClose(DialogIDs.USER, choice)}
      />
      <ConfirmNewQuestDialog
        open={open[DialogIDs.CONFIRM_NEW_QUEST]}
        onRequestClose={(choice) => onRequestClose(DialogIDs.CONFIRM_NEW_QUEST, choice)}
      />
      <ConfirmLoadQuestDialog
        open={open[DialogIDs.CONFIRM_LOAD_QUEST]}
        onRequestClose={(choice) => onRequestClose(DialogIDs.CONFIRM_LOAD_QUEST, choice)}
      />
      <PublishQuestDialog
        open={open[DialogIDs.PUBLISH_QUEST]}
        onRequestClose={(choice) => onRequestClose(DialogIDs.PUBLISH_QUEST, choice)}
        shortUrl={short_url}
      />
    </span>
  );
}

export default Dialogs;