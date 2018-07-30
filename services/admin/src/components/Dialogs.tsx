import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';

import {FeedbackEntry, QuestEntry, UserEntry} from 'api/admin/QueryTypes';

import {DialogIDType, DialogsState} from '../reducers/StateTypes';

export interface DialogsStateProps {
  dialogs: DialogsState;
  feedback: FeedbackEntry|null;
  quest: QuestEntry|null;
  user: UserEntry|null;
}

export interface DialogsDispatchProps {
  onClose: (dialog: DialogIDType) => void;
  onSetUserLootPoints: (user: UserEntry, lootPoints: number) => any;
  onSetQuestPublishState: (quest: QuestEntry, published: boolean) => any;
  onSetFeedbackSuppressed: (feedback: FeedbackEntry, suppress: boolean) => any;
}

export interface FeedbackDetailsDialogProps {
  open: boolean;
  feedback: FeedbackEntry;
  onClose: () => any;
  onSetFeedbackSuppressed: (feedback: FeedbackEntry, suppress: boolean) => any;
}
export class FeedbackDetailsDialog extends React.Component<FeedbackDetailsDialogProps, {}> {
  public render(): JSX.Element {
    const actions = [<Button onClick={() => this.props.onClose()}>Close</Button>];
    if (this.props.feedback.suppressed) {
      actions.push(<Button onClick={() => {this.props.onSetFeedbackSuppressed(this.props.feedback, false); }}>Unsuppress</Button>);
    } else {
      actions.push(<Button onClick={() => {this.props.onSetFeedbackSuppressed(this.props.feedback, true); }}>Suppress</Button>);
    }
    return (
      <Dialog
        open={Boolean(this.props.open)}
        onClose={() => this.props.onClose()}
      >
        <DialogTitle>Feedback</DialogTitle>
        <DialogContent className="dialog">
          <DialogContentText>
            <p>User: {this.props.feedback.user.email}</p>
            <p>Quest: {this.props.feedback.quest.title}</p>
            <p>Partition: {this.props.feedback.partition}</p>
            <p>Rating: {this.props.feedback.rating}</p>
            <p>Text: {this.props.feedback.text}</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export interface QuestDetailsDialogProps {
  open: boolean;
  quest: QuestEntry;
  onClose: () => any;
  onSetQuestPublishState: (quest: QuestEntry, published: boolean) => any;
}
export class QuestDetailsDialog extends React.Component<QuestDetailsDialogProps, {}> {
  public render(): JSX.Element {
    const actions = [<Button onClick={() => this.props.onClose()}>Close</Button>];
    if (this.props.quest.published) {
      actions.push(<Button onClick={() => {this.props.onSetQuestPublishState(this.props.quest, false); }}>Unpublish</Button>);
    } else {
      actions.push(<Button onClick={() => {this.props.onSetQuestPublishState(this.props.quest, true); }}>Publish</Button>);
    }
    return (
      <Dialog
        open={Boolean(this.props.open)}
        onClose={() => this.props.onClose()}
      >
        <DialogTitle>Quest</DialogTitle>
        <DialogContent className="dialog">
          <DialogContentText>
            <p>Author Email: {this.props.quest.user.email}</p>
            <p>Quest: {this.props.quest.title} ({this.props.quest.partition})</p>
            {this.props.quest.ratingavg !== null && <p>Avg Rating: {this.props.quest.ratingavg} ({this.props.quest.ratingcount} ratings)</p>}
            <p>Published: {this.props.quest.published ? 'Yes' : 'No'}</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {actions}
        </DialogActions>
      </Dialog>
    );
  }
}

export interface UserDetailsDialogProps {
  open: boolean;
  user: UserEntry;
  onClose: () => any;
  onSetUserLootPoints: (user: UserEntry, lootPoints: number) => any;
}
export class UserDetailsDialog extends React.Component<UserDetailsDialogProps, {new_loot: number|null}> {
  constructor(props: UserDetailsDialogProps) {
    super(props);

    this.state = {
      new_loot: null,
    };
  }

  public handleLootChange = (value: string) => {
    if (value === '') {
      return this.setState({new_loot: null});
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      return;
    }
    this.setState({
      new_loot: parsed,
    });
  }

  public render(): JSX.Element {
    return (
      <Dialog
        open={Boolean(this.props.open)}
        onClose={() => this.props.onClose()}
      >
        <DialogTitle>User</DialogTitle>
        <DialogContent className="dialog">
          <DialogContentText>
            <p>Name: {this.props.user.name}</p>
            <p>Email: {this.props.user.email}</p>
            <p>Loot points: {this.props.user.loot_points}</p>
            <TextField
              id="new_loot"
              value={this.state.new_loot || ''}
              onChange={(e: any) => this.handleLootChange(e.target.value)}
            />
            <Button onClick={() => {
              if (this.state.new_loot) {
                this.props.onSetUserLootPoints(this.props.user, this.state.new_loot);
              }
            }}>
              Set
            </Button>
            <p>Last login: {this.props.user.last_login.toISOString()}</p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onClose()}>Close</Button>
        </DialogActions>
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
        onClose={() => props.onClose('FEEDBACK_DETAILS')}
        onSetFeedbackSuppressed={props.onSetFeedbackSuppressed}
      />}
      {props.quest &&
      <QuestDetailsDialog
        open={props.dialogs && props.dialogs.open === 'QUEST_DETAILS'}
        quest={props.quest}
        onClose={() => props.onClose('QUEST_DETAILS')}
        onSetQuestPublishState={props.onSetQuestPublishState}
      />}
      {props.user &&
      <UserDetailsDialog
        open={props.dialogs && props.dialogs.open === 'USER_DETAILS'}
        user={props.user}
        onClose={() => props.onClose('USER_DETAILS')}
        onSetUserLootPoints={props.onSetUserLootPoints}
      />}
    </span>
  );
};

export default Dialogs;
