import * as React from 'react'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import LinkIcon from 'material-ui/svg-icons/content/link'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
import RaisedButton from 'material-ui/RaisedButton'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'

import {FeedbackEntry, QuestEntry, UserEntry} from 'expedition-api/app/admin/QueryTypes'

import {DialogsState, DialogIDType} from '../reducers/StateTypes'

export interface DialogsStateProps {
  dialogs: DialogsState;
  feedback: FeedbackEntry|null;
  quest: QuestEntry|null;
  user: UserEntry|null;
};

export interface DialogsDispatchProps {
  onRequestClose: (dialog: DialogIDType) => void;
}

export interface FeedbackDetailsDialogProps {
  open: boolean;
  feedback: FeedbackEntry;
  onRequestClose: () => any;
}
export class FeedbackDetailsDialog extends React.Component<FeedbackDetailsDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Feedback"
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        onRequestClose={() => this.props.onRequestClose()}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>]}
      >
        <p>User: {this.props.feedback.user.email}</p>
        <p>Quest: {this.props.feedback.quest.title}</p>
        <p>Rating: {this.props.feedback.rating}</p>
        <p>Text: {this.props.feedback.text}</p>
      </Dialog>
    );
  }
}


export interface QuestDetailsDialogProps {
  open: boolean;
  quest: QuestEntry;
  onRequestClose: () => any;
}
export class QuestDetailsDialog extends React.Component<QuestDetailsDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Quest"
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        onRequestClose={() => this.props.onRequestClose()}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>]}
      >
        <p>Author Email: {this.props.quest.user.email}</p>
        <p>Quest: {this.props.quest.title} ({this.props.quest.partition})</p>
        {this.props.quest.ratingavg !== null && <p>Avg Rating: {this.props.quest.ratingavg} ({this.props.quest.ratingcount} ratings)</p>}
        <p>Visibility: {this.props.quest.visibility}</p>
      </Dialog>
    );
  }
}

export interface UserDetailsDialogProps {
  open: boolean;
  user: UserEntry;
  onRequestClose: () => any;
}
export class UserDetailsDialog extends React.Component<UserDetailsDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="User"
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        onRequestClose={() => this.props.onRequestClose()}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>]}
      >
        <p>Name: {this.props.user.name}</p>
        <p>Email: {this.props.user.email}</p>
        <p>Loot points: {this.props.user.loot_points}</p>
        <p>Last login: {this.props.user.last_login.toISOString()}</p>
      </Dialog>
    );
  }
}


interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      {props.feedback &&
      <FeedbackDetailsDialog
        open={props.dialogs && props.dialogs.open === 'FEEDBACK_DETAILS'}
        feedback={props.feedback}
        onRequestClose={() => props.onRequestClose('FEEDBACK_DETAILS')}
      />}
      {props.quest &&
      <QuestDetailsDialog
        open={props.dialogs && props.dialogs.open === 'QUEST_DETAILS'}
        quest={props.quest}
        onRequestClose={() => props.onRequestClose('QUEST_DETAILS')}
      />}
      {props.user &&
      <UserDetailsDialog
        open={props.dialogs && props.dialogs.open === 'USER_DETAILS'}
        user={props.user}
        onRequestClose={() => props.onRequestClose('USER_DETAILS')}
      />}
    </span>
  );
}

export default Dialogs;
