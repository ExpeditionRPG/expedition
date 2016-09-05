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
          label="OK"
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

class ErrorDialog extends React.Component {
  render() {

    var errors = [];
    for (var i = 0; i < this.props.errors.length; i++) {
      errors.push(<div key={i}>{this.props.errors[i].toString()}</div>);
    }

    return (
      <Dialog
        title="ERROR"
        actions={<RaisedButton
          label="OK"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />}
        modal={false}
        open={Boolean(this.props.open)}>
        {errors}
      </Dialog>
    );
  }
}

class UserDialog extends React.Component {
  render() {
    var title;
    var actions = [
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.props.onRequestClose}
      />,
    ];

    if (this.props.userName) {
      title = "Signed In As " + this.props.userName;
      actions.push(
        <RaisedButton
          label="Sign Out"
          primary={true}
          onTouchTap={this.props.onSignIn}
        />);
    } else {
      title = "Not Signed In";
      actions.push(
        <RaisedButton
          label="Sign In"
          primary={true}
          onTouchTap={this.props.onSignOut}
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

const Dialogs = ({open, user_name, short_url, errors, onRequestClose, onConfirm, onSignIn, onSignOut}) => {
  return (
    <span>
      <UserDialog
        open={open[DialogIDs.USER]}
        userName={user_name}
        onSignIn={onSignIn}
        onSignOut={onSignOut}
        onRequestClose={() => onRequestClose(DialogIDs.USER)}
      />
      <ConfirmNewQuestDialog
        open={open[DialogIDs.CONFIRM_NEW_QUEST]}
        onConfirm={() => onConfirm(DialogIDs.CONFIRM_NEW_QUEST)}
        onRequestClose={() => onRequestClose(DialogIDs.CONFIRM_NEW_QUEST)}
      />
      <ConfirmLoadQuestDialog
        open={open[DialogIDs.CONFIRM_LOAD_QUEST]}
        onConfirm={() => onConfirm(DialogIDs.CONFIRM_LOAD_QUEST)}
        onRequestClose={() => onRequestClose(DialogIDs.CONFIRM_LOAD_QUEST)}
      />
      <PublishQuestDialog
        open={open[DialogIDs.PUBLISH_QUEST]}
        onRequestClose={() => onRequestClose(DialogIDs.PUBLISH_QUEST)}
        shortUrl={short_url}
      />
      <ErrorDialog
        open={open[DialogIDs.ERROR]}
        onRequestClose={() => onRequestClose(DialogIDs.ERROR)}
        errors={errors}
      />
    </span>
  );
}

export default Dialogs;