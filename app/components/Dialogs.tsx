/// <reference path="../../typings/react/react.d.ts" />
import * as React from 'react';
import Dialog from 'material-ui/Dialog';
import {TouchTapEventHandler} from 'material-ui';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {UserType, QuestType, DialogsType, DialogIDType} from '../reducers/StateTypes';
import {ErrorType} from '../error';

var XMLParserError: any = (require('../../translation/to_markdown') as any).XMLParserError;
var MarkdownParserError: any = (require('../../translation/to_xml') as any).MarkdownParserError;

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
  onRequestClose: ()=>void;
  onConfirm: (result: boolean) => void;
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
  errors: ErrorType[];
  onRequestClose: ()=>void;
}

export class ErrorDialog extends React.Component<ErrorDialogProps, {}> {
  render() {

    var errors: ErrorType[] = [];
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
  onSignOut: ()=>void;
  onSignIn: ()=>void;
  onRequestClose: ()=>void;
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

export interface DialogsStateProps {
  open: DialogsType;
  user: UserType;
  quest: QuestType;
  errors: ErrorType[];
};

export interface DialogsDispatchProps {
  onRequestClose: (dialog: DialogIDType)=>any;
  onConfirmSave: (dialog: DialogIDType, choice: boolean, id: string)=>any; // TODO make these void
  onSignIn: (link: string)=>void;
  onSignOut: (link: string)=>void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <UserDialog
        open={props.open['USER']}
        userName={props.user.profile.displayName}
        onSignIn={() => props.onSignIn(props.user.login)}
        onSignOut={() => props.onSignOut(props.user.logout)}
        onRequestClose={() => props.onRequestClose('USER')}
      />
      <ConfirmNewQuestDialog
        open={props.open['CONFIRM_NEW_QUEST']}
        onConfirm={(choice) => props.onConfirmSave('CONFIRM_NEW_QUEST', choice, props.quest.id)}
        onRequestClose={() => props.onRequestClose('CONFIRM_NEW_QUEST')}
      />
      <ConfirmLoadQuestDialog
        open={props.open['CONFIRM_LOAD_QUEST']}
        onConfirm={(choice) => props.onConfirmSave('CONFIRM_LOAD_QUEST', choice, props.quest.id)}
        onRequestClose={() => props.onRequestClose('CONFIRM_LOAD_QUEST')}
      />
      <PublishQuestDialog
        open={props.open['PUBLISH_QUEST']}
        onRequestClose={() => props.onRequestClose('PUBLISH_QUEST')}
        shortUrl={props.quest.short_url}
      />
      <ErrorDialog
        open={props.open['ERROR']}
        onRequestClose={() => props.onRequestClose('ERROR')}
        errors={props.errors}
      />
    </span>
  );
}

export default Dialogs;