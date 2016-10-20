/// <reference path="../../typings/react/react.d.ts" />
import * as React from 'react';
import Dialog from 'material-ui/Dialog';
import {TouchTapEventHandler} from 'material-ui';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {QuestType, ShareType, DialogsState, DialogIDType} from '../reducers/StateTypes';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Toggle from 'material-ui/Toggle';
import LinkIcon from 'material-ui/svg-icons/content/link';
import {ErrorType} from '../error';
import theme from '../theme';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

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

interface SharingSettingsDialogProps extends React.Props<any> {
  open: boolean;
  onRequestClose: any;
  quest: QuestType;
  onShareChange: (sharing: ShareType, id: string)=>void;
}

export class SharingSettingsDialog extends React.Component<SharingSettingsDialogProps, {}> {
  style: any;

  constructor(props: any) {
    super(props);
    this.style = {
      shareToggle: {
        marginBottom: "30px"
      },
      halfpanel: {
        width: "50%",
        float: "left",
      },
      block: {
        width: "50%",
        float: "right",
        marginBottom: 40,
        padding: 20,
        background: theme.palette.primary2Color,
        textAlign: "center",
      },
      radiobutton: {
        marginBottom: 10,
      },
    };
  }

  render() {
    var status: JSX.Element = <span></span>;
    var selected: string;
    if (!this.props.quest.published && !this.props.quest.shared) {
      status = (<h2>Quest is Private</h2>);
      selected = 'PRIVATE';
    } else if (this.props.quest.published) {
      status = (<h2>Quest is Public</h2>);
      selected = 'PUBLIC';
    } else { // this.props.quest.shared
      status = (
        <span>
          <h2>Quest is Unlisted</h2>
          <h3>Quest ID: "<strong>{this.props.quest.id}</strong>"</h3>
          <p>Enter this ID into the search box in the App to load your quest.</p>
        </span>
      );
      selected = 'UNLISTED';
    }
    return (
      <Dialog
        title="Sharing Settings"
        actions={<RaisedButton
          label="Ok"
          primary={true}
          onTouchTap={() => this.props.onRequestClose()}
        />}
        modal={false}
        open={Boolean(this.props.open)}>
        <RadioButtonGroup name="shareSetting" defaultSelected={selected} onChange={(e: any, value: ShareType)=>this.props.onShareChange(value, this.props.quest.id)} style={this.style.halfpanel}>
          <RadioButton
            value="PRIVATE"
            label={<span><strong>Private</strong><div>No other users except for yourself can view this quest.</div></span>}
            style={this.style.radiobutton}
          />
          <RadioButton
            value="UNLISTED"
            label={<span><strong>Unlisted</strong><div>Players may play this quest by entering the Quest ID into the search bar of the App.</div></span>}
            style={this.style.radiobutton}
          />
          <RadioButton
            value="PUBLIC"
            label={<span><strong>Public</strong><div>The quest is shown as part of normal search results.</div></span>}
            style={this.style.radiobutton}
          />
        </RadioButtonGroup>
        <Paper style={this.style.block} zDepth={2} >
          {status}
        </Paper>
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

interface PublishedDialogProps extends React.Props<any> {
  open: boolean;
  onRequestClose: ()=>void;
}

export class PublishedDialog extends React.Component<PublishedDialogProps, {}> {
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
        Your quest has been published and is now visible in the Expedition App.
      </Dialog>
    );
  }
}


export interface DialogsStateProps {
  open: DialogsState;
  quest: QuestType;
  errors: ErrorType[];
};

export interface DialogsDispatchProps {
  onRequestClose: (dialog: DialogIDType)=>void;
  onConfirmSave: (dialog: DialogIDType, choice: boolean, id: string)=>void;
  onShareChange: (share: ShareType, id: string)=>void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

// TODO: Input args should be way shorter than this
const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
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
      <SharingSettingsDialog
        open={props.open['SHARE_SETTINGS']}
        onRequestClose={() => props.onRequestClose('SHARE_SETTINGS')}
        onShareChange={props.onShareChange}
        quest={props.quest}
      />
      <ErrorDialog
        open={props.open['ERROR']}
        onRequestClose={() => props.onRequestClose('ERROR')}
        errors={props.errors}
      />
      <PublishedDialog
        open={props.open['PUBLISHED']}
        onRequestClose={() => props.onRequestClose('PUBLISHED')}
      />
    </span>
  );
}

export default Dialogs;