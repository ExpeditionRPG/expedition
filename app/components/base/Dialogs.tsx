import * as React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import {RemotePlayCounters} from '../../RemotePlay'
import {ContentSetsType, DialogIDType, DialogState, QuestState, SettingsType, UserState, UserFeedbackState} from '../../reducers/StateTypes'
import {QuestDetails} from '../../reducers/QuestTypes'
import {openWindow} from '../../Globals'


interface ExitQuestDialogProps extends React.Props<any> {
  open: boolean;
  onExitQuest: () => void;
  onRequestClose: () => void;
}

export class ExitQuestDialog extends React.Component<ExitQuestDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Exit quest?"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onExitQuest()}>Exit</FlatButton>
        ]}
      >
        <p>Tapping exit will lose your place in the quest and return you to the home screen.</p>
      </Dialog>
    );
  }
}

interface ExitRemotePlayDialogProps extends React.Props<any> {
  open: boolean;
  onExitRemotePlay: () => void;
  onRequestClose: () => void;
}

export class ExitRemotePlayDialog extends React.Component<ExitRemotePlayDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Exit Remote Play?"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onExitRemotePlay()}>Exit</FlatButton>
        ]}
      >
        <p>Tapping exit will disconnect you from your peers and return you to the home screen.</p>
      </Dialog>
    );
  }
}

interface RemotePlayStatusDialogProps extends React.Props<any> {
  open: boolean;
  stats: RemotePlayCounters;
  user: UserState;
  questDetails: QuestDetails;
  onSendReport: (user: UserState, quest: QuestDetails, stats: RemotePlayCounters) => void;
  onRequestClose: () => void;
}

export class RemotePlayStatusDialog extends React.Component<RemotePlayStatusDialogProps, {}> {
  render(): JSX.Element {

    const stats = <ul>{
        Object.keys(this.props.stats).map((k, i) => {
          return <li key={i}>{k}: {this.props.stats[k]}</li>
        })
      }</ul>;

    return (
      <Dialog
        title="Remote Play Stats"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        autoScrollBodyContent={true}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onSendReport(this.props.user, this.props.questDetails, this.props.stats)}>Send Report</FlatButton>
        ]}
      >
        <p>Here's some remote play debugging information:</p>
        {stats}
        <p>
          If you're experiencing problems with remote play, please
          tap "Send Report" below to send a log to the Expedition team. Thanks!
        </p>
      </Dialog>
    );
  }
}

interface ExpansionSelectDialogProps extends React.Props<any> {
  open: boolean;
  onExpansionSelect: (contentSets: ContentSetsType) => void;
}

// TODO November: once The Horror is available for purchase, add a buy button that links to Expedition store page
// https://github.com/ExpeditionRPG/expedition-app/issues/476
export class ExpansionSelectDialog extends React.Component<ExpansionSelectDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Choose Game"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[]}
      >
        <FlatButton className="primary large" onTouchTap={() => this.props.onExpansionSelect({horror: false})}>Expedition</FlatButton>
        <br/>
        <br/>
        <FlatButton className="primary large" onTouchTap={() => this.props.onExpansionSelect({horror: true})}><span className="line">Expedition</span> <span className="line">+ The Horror</span></FlatButton>
        <p style={{textAlign: 'center', marginTop: '1.5em'}}>This will only appear once, but you can always change it in Settings.</p>
        <p style={{textAlign: 'center', marginTop: '1.5em'}}>Don't have the cards? <strong><a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>Get a copy</a></strong>.</p>
      </Dialog>
    );
  }
}

interface FeedbackDialogProps extends React.Props<any> {
  open: boolean;
  onFeedbackChange: (text: string) => void;
  onFeedbackSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onRequestClose: () => void;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export class FeedbackDialog extends React.Component<FeedbackDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Send Feedback"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onFeedbackSubmit(this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>Submit</FlatButton>
        ]}
      >
        <p>Thank you for taking the time to give us feedback! If you've encountered a bug, please include the steps that you can take to reproduce the issue.</p>
        <TextField
          className="textfield"
          fullWidth={true}
          hintText="Your feedback here"
          multiLine={true}
          onChange={(e: any) => this.props.onFeedbackChange(e.target.value)}
          rows={3}
          rowsMax={6}
          underlineShow={false}
          value={this.props.userFeedback.text}
        />
      </Dialog>
    );
  }
}

interface ReportErrorDialogProps extends React.Props<any> {
  error: string;
  open: boolean;
  onFeedbackChange: (text: string) => void;
  onReportErrorSubmit: (error: string, quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onRequestClose: () => void;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export class ReportErrorDialog extends React.Component<ReportErrorDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Report Error"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onReportErrorSubmit(this.props.error, this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>Submit</FlatButton>
        ]}
      >
        <p>Thank you for taking the time to report an error! What were you doing when the error occurred?</p>
        <TextField
          className="textfield"
          fullWidth={true}
          hintText="What you were doing at the time of the error"
          multiLine={true}
          onChange={(e: any) => this.props.onFeedbackChange(e.target.value)}
          rows={3}
          rowsMax={6}
          underlineShow={false}
          value={this.props.userFeedback.text}
        />
      </Dialog>
    );
  }
}

interface ReportQuestDialogProps extends React.Props<any> {
  open: boolean;
  onFeedbackChange: (text: string) => void;
  onReportQuestSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onRequestClose: () => void;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
}

export class ReportQuestDialog extends React.Component<ReportQuestDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Report Quest"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onReportQuestSubmit(this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>Submit</FlatButton>
        ]}
      >
        <p>You're reporting an issue with <i>{this.props.quest.details.title}</i>.</p>
        <p>You should report a quest (instead of reviewing it at the end of the quest) if it is:</p>
        <ul>
          <li>Offensive or inappropriate for the age level it claimed to be.</li>
          <li>Broken or buggy.</li>
          <li>Incomplete or missing sections.</li>
        </ul>
        <TextField
          className="textfield"
          fullWidth={true}
          hintText="Describe the issue"
          multiLine={true}
          onChange={(e: any) => this.props.onFeedbackChange(e.target.value)}
          rows={3}
          rowsMax={6}
          underlineShow={false}
          value={this.props.userFeedback.text}
        />
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  dialog: DialogState;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
  remotePlayStats: RemotePlayCounters;
};

export interface DialogsDispatchProps {
  onExitQuest: () => void;
  onExitRemotePlay: () => void;
  onExpansionSelect: (contentSets: ContentSetsType) => void;
  onFeedbackChange: (text: string) => void;
  onFeedbackSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onReportErrorSubmit: (error: string, quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onReportQuestSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onSendRemotePlayReport: (user: UserState, quest: QuestDetails, stats: RemotePlayCounters) => void;
  onRequestClose: () => void;
}

interface DialogsProps extends DialogsStateProps, DialogsDispatchProps {}

const Dialogs = (props: DialogsProps): JSX.Element => {
  return (
    <span>
      <ExitQuestDialog
        open={props.dialog && props.dialog.open === 'EXIT_QUEST'}
        onExitQuest={props.onExitQuest}
        onRequestClose={props.onRequestClose}
      />
      <ExpansionSelectDialog
        open={props.dialog && props.dialog.open === 'EXPANSION_SELECT'}
        onExpansionSelect={(contentSets: ContentSetsType) => props.onExpansionSelect(contentSets)}
      />
      <ExitRemotePlayDialog
        open={props.dialog && props.dialog.open === 'EXIT_REMOTE_PLAY'}
        onExitRemotePlay={props.onExitRemotePlay}
        onRequestClose={props.onRequestClose}
      />
      <RemotePlayStatusDialog
        open={props.dialog && props.dialog.open === 'REMOTE_PLAY_STATUS'}
        stats={props.remotePlayStats}
        user={props.user}
        questDetails={props.quest.details}
        onSendReport={props.onSendRemotePlayReport}
        onRequestClose={props.onRequestClose}
      />
      <FeedbackDialog
        open={props.dialog && props.dialog.open === 'FEEDBACK'}
        onFeedbackChange={props.onFeedbackChange}
        onFeedbackSubmit={props.onFeedbackSubmit}
        onRequestClose={props.onRequestClose}
        quest={props.quest || {details: {}} as any}
        settings={props.settings}
        user={props.user}
        userFeedback={props.userFeedback}
      />
      <ReportErrorDialog
        error={props.dialog && props.dialog.message || ''}
        open={props.dialog && props.dialog.open === 'REPORT_ERROR'}
        onFeedbackChange={props.onFeedbackChange}
        onReportErrorSubmit={props.onReportErrorSubmit}
        onRequestClose={props.onRequestClose}
        quest={props.quest || {details: {}} as any}
        settings={props.settings}
        user={props.user}
        userFeedback={props.userFeedback}
      />
      <ReportQuestDialog
        open={props.dialog && props.dialog.open === 'REPORT_QUEST'}
        onFeedbackChange={props.onFeedbackChange}
        onReportQuestSubmit={props.onReportQuestSubmit}
        onRequestClose={props.onRequestClose}
        quest={props.quest || {details: {}} as any}
        settings={props.settings}
        user={props.user}
        userFeedback={props.userFeedback}
      />
    </span>
  );
}

export default Dialogs;
