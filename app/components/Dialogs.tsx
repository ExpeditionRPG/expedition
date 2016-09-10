import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {MarkdownParserError} from 'to_xml'
import {XMLParserError} from 'to_markdown'

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

interface YesNoDialogProps extends React.Props<any> {
  open: boolean;
  onRequestClose: any;
  onConfirm: (result: boolean)=>any;
}

class YesNoDialog extends React.Component<YesNoDialogProps, {}> {
  title: string;

  constructor(props: any) {
    super(props)
    this.title = "";
  }

  render() {
    var actions = [
      <RaisedButton
        label="Yes"
        primary={true}
        onTouchTap={() => this.props.onConfirm(true)}
      />,
      <RaisedButton
        label="No"
        primary={true}
        onTouchTap={() => this.props.onConfirm(false)}
      />,
      <RaisedButton
        label="Cancel"
        primary={true}
        onTouchTap={this.props.onRequestClose}
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
  constructor(props: any) {
    super(props)
    this.title = "Save changes before creating new quest?";
  }
}

export class ConfirmLoadQuestDialog extends YesNoDialog {
  constructor(props: any) {
    super(props)
    this.title = "Save changes before loading new quest?";
  }
}

interface PublishQuestDialogProps extends React.Props<any> {
  open: boolean;
  onRequestClose: any;
  shortUrl: string;
}

export class PublishQuestDialog extends React.Component<PublishQuestDialogProps, {}> {
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

interface ErrorDialogProps extends React.Props<any> {
  open: boolean;
  errors: any[];
  onRequestClose: any;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  render() {

    var errors: any[] = [];
    for (var i = 0; i < this.props.errors.length; i++) {
      var error = this.props.errors[i];
      console.log(error.stack);

      if (error instanceof MarkdownParserError || error instanceof XMLParserError) {
        errors.push(<div key={i}>
          <strong>{error.name}: "{error.message}"</strong>
          <div><strong>Line:</strong> {error.line}</div>
          <div><strong>Usage:</strong> {error.usage}</div>
        </div>);
        continue;
      }
      errors.push(<div key={i}>{error.toString()}</div>);
    }

    return (
      <Dialog
        title="Errors Occurred"
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

interface UserDialogProps extends React.Props<any> {
  open: boolean;
  userName: string;
  onSignOut: any;
  onSignIn: any;
  onRequestClose: any;
}

export class UserDialog extends React.Component<UserDialogProps, {}> {
  render(): JSX.Element {
    let title: string = "";
    var actions: JSX.Element[] = [
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
          onTouchTap={this.props.onSignOut}
        />);
    } else {
      title = "Not Signed In";
      actions.push(
        <RaisedButton
          label="Sign In"
          primary={true}
          onTouchTap={this.props.onSignIn}
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

// TODO: Input args should be way shorter than this
const Dialogs = ({id, xml, open, user_name, login_url, logout_url, short_url, errors, onRequestClose, onConfirmSave, onSignIn, onSignOut} : any): JSX.Element => {
  return (
    <span>
      <UserDialog
        open={open['USER']}
        userName={user_name}
        onSignIn={() => onSignIn(login_url)}
        onSignOut={() => onSignOut(logout_url)}
        onRequestClose={() => onRequestClose('USER')}
      />
      <ConfirmNewQuestDialog
        open={open['CONFIRM_NEW_QUEST']}
        onConfirm={(choice) => onConfirmSave('CONFIRM_NEW_QUEST', choice, id, xml)}
        onRequestClose={() => onRequestClose('CONFIRM_NEW_QUEST')}
      />
      <ConfirmLoadQuestDialog
        open={open['CONFIRM_LOAD_QUEST']}
        onConfirm={(choice) => onConfirmSave('CONFIRM_LOAD_QUEST', choice, id, xml)}
        onRequestClose={() => onRequestClose('CONFIRM_LOAD_QUEST')}
      />
      <PublishQuestDialog
        open={open['PUBLISH_QUEST']}
        onRequestClose={() => onRequestClose('PUBLISH_QUEST')}
        shortUrl={short_url}
      />
      <ErrorDialog
        open={open['ERROR']}
        onRequestClose={() => onRequestClose('ERROR')}
        errors={errors}
      />
    </span>
  );
}

export default Dialogs;