import * as React from 'react'

import Dialog from 'material-ui/Dialog'
import Button from '@material-ui/core/Button'
import LinkIcon from 'material-ui/svg-icons/content/link'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'
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
  onSetUserLootPoints: (user: UserEntry, loot_points: number) => any;
  onSetQuestPublishState: (quest: QuestEntry, published: boolean) => any;
  onSetFeedbackSuppressed: (feedback: FeedbackEntry, suppress: boolean) => any;
}

export interface FeedbackDetailsDialogProps {
  open: boolean;
  feedback: FeedbackEntry;
  onRequestClose: () => any;
  onSetFeedbackSuppressed: (feedback: FeedbackEntry, suppress: boolean) => any;
}
export class FeedbackDetailsDialog extends React.Component<FeedbackDetailsDialogProps, {}> {
  render(): JSX.Element {
    const actions = [<Button onClick={() => this.props.onRequestClose()} label="Close"/>];
    if (this.props.feedback.suppressed) {
      actions.push(<Button onClick={() => {this.props.onSetFeedbackSuppressed(this.props.feedback, false)}} label="Unsuppress"/>);
    } else {
      actions.push(<Button onClick={() => {this.props.onSetFeedbackSuppressed(this.props.feedback, true)}} label="Suppress"/>);
    }
    return (
      <Dialog
        title="Feedback"
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        onRequestClose={() => this.props.onRequestClose()}
        actions={actions}
      >
        <p>User: {this.props.feedback.user.email}</p>
        <p>Quest: {this.props.feedback.quest.title}</p>
        <p>Partition: {this.props.feedback.partition}</p>
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
  onSetQuestPublishState: (quest: QuestEntry, published: boolean) => any;
}
export class QuestDetailsDialog extends React.Component<QuestDetailsDialogProps, {}> {
  render(): JSX.Element {
    const actions = [<Button onClick={() => this.props.onRequestClose()} label="Close"/>];
    if (this.props.quest.published) {
      actions.push(<Button onClick={() => {this.props.onSetQuestPublishState(this.props.quest, false)}} label="Unpublish"/>);
    } else {
      actions.push(<Button onClick={() => {this.props.onSetQuestPublishState(this.props.quest, true)}} label="Publish"/>);
    }
    return (
      <Dialog
        title="Quest"
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        onRequestClose={() => this.props.onRequestClose()}
        actions={actions}
      >
        <p>Author Email: {this.props.quest.user.email}</p>
        <p>Quest: {this.props.quest.title} ({this.props.quest.partition})</p>
        {this.props.quest.ratingavg !== null && <p>Avg Rating: {this.props.quest.ratingavg} ({this.props.quest.ratingcount} ratings)</p>}
        <p>Published: {this.props.quest.published ? 'Yes' : 'No'}</p>
      </Dialog>
    );
  }
}

export interface UserDetailsDialogProps {
  open: boolean;
  user: UserEntry;
  onRequestClose: () => any;
  onSetUserLootPoints: (user: UserEntry, loot_points: number) => any;
}
export class UserDetailsDialog extends React.Component<UserDetailsDialogProps, {new_loot: number|null}> {
  constructor(props: UserDetailsDialogProps) {
    super(props);

    this.state = {
      new_loot: null,
    };
  }

  handleLootChange = (event: React.FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === '') {
      return this.setState({new_loot: null});
    }
    const parsed = parseInt(event.currentTarget.value, 10);
    if (isNaN(parsed)) {
      return;
    }
    this.setState({
      new_loot: parsed,
    });
  };

  render(): JSX.Element {
    return (
      <Dialog
        title="User"
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        onRequestClose={() => this.props.onRequestClose()}
        actions={[<Button onClick={() => this.props.onRequestClose()} label="Close"/>]}
      >
        <p>Name: {this.props.user.name}</p>
        <p>Email: {this.props.user.email}</p>
        <p>Loot points: {this.props.user.loot_points}</p>
        <TextField id="new_loot" value={this.state.new_loot || ''} onChange={this.handleLootChange} />
        <Button onClick={() => {(this.state.new_loot !== null) && this.props.onSetUserLootPoints(this.props.user, this.state.new_loot)}} label="Set"/>
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
        onSetFeedbackSuppressed={props.onSetFeedbackSuppressed}
      />}
      {props.quest &&
      <QuestDetailsDialog
        open={props.dialogs && props.dialogs.open === 'QUEST_DETAILS'}
        quest={props.quest}
        onRequestClose={() => props.onRequestClose('QUEST_DETAILS')}
        onSetQuestPublishState={props.onSetQuestPublishState}
      />}
      {props.user &&
      <UserDetailsDialog
        open={props.dialogs && props.dialogs.open === 'USER_DETAILS'}
        user={props.user}
        onRequestClose={() => props.onRequestClose('USER_DETAILS')}
        onSetUserLootPoints={props.onSetUserLootPoints}
      />}
    </span>
  );
}

export default Dialogs;
