import * as React from 'react'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import Checkbox from './Checkbox'
import Picker from './Picker'
import {MultiplayerCounters} from '../../Multiplayer'
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

interface ExitMultiplayerDialogProps extends React.Props<any> {
  open: boolean;
  onExitMultiplayer: () => void;
  onRequestClose: () => void;
}

export class ExitMultiplayerDialog extends React.Component<ExitMultiplayerDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        title="Exit Multiplayer?"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onExitMultiplayer()}>Exit</FlatButton>
        ]}
      >
        <p>Tapping exit will disconnect you from your peers and return you to the home screen.</p>
      </Dialog>
    );
  }
}

interface MultiplayerStatusDialogProps extends React.Props<any> {
  open: boolean;
  stats: MultiplayerCounters;
  user: UserState;
  questDetails: QuestDetails;
  onSendReport: (user: UserState, quest: QuestDetails, stats: MultiplayerCounters) => void;
  onRequestClose: () => void;
}

export class MultiplayerStatusDialog extends React.Component<MultiplayerStatusDialogProps, {}> {
  render(): JSX.Element {

    const stats = <ul>{
        Object.keys(this.props.stats).map((k, i) => {
          return <li key={i}>{k}: {this.props.stats[k]}</li>
        })
      }</ul>;

    return (
      <Dialog
        title="Multiplayer Stats"
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        autoScrollBodyContent={true}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          <FlatButton className="primary" onTouchTap={() => this.props.onSendReport(this.props.user, this.props.questDetails, this.props.stats)}>Send Report</FlatButton>
        ]}
      >
        <p>Here's some multiplayer debugging information:</p>
        {stats}
        <p>
          If you're experiencing problems with multiplayer, please
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

interface SetPlayerCountDialogProps extends React.Props<any> {
  open: boolean;
  onMultitouchChange: (v: boolean) => void;
  onPlayerDelta: (numPlayers: number, delta: number) => void;
  onRequestClose: () => void;
  playQuest: (quest: QuestDetails) => void;
  quest: QuestDetails;
  settings: SettingsType;
}

export class SetPlayerCountDialog extends React.Component<SetPlayerCountDialogProps, {}> {
  render(): JSX.Element {
    const quest = this.props.quest;
    let playersAllowed = true;
    if (quest.minplayers && quest.maxplayers) {
      playersAllowed = (this.props.settings.numPlayers >= quest.minplayers &&
        this.props.settings.numPlayers <= quest.maxplayers);
    }
    const horrorError = quest.expansionhorror && !this.props.settings.contentSets.horror;
    return (
      <Dialog
        title={horrorError ? 'Expansion Required' : 'How many players?'}
        modal={true}
        contentClassName="dialog"
        open={Boolean(this.props.open)}
        actions={[<FlatButton onTouchTap={() => this.props.onRequestClose()}>Cancel</FlatButton>,
          (!horrorError ? <FlatButton disabled={!playersAllowed} className="primary" onTouchTap={() => this.props.playQuest(this.props.quest)}>Play</FlatButton> : <span></span>),
        ]}
      >
        {horrorError && <div className="error">The Horror expansion is required to play this quest. If you have it, make sure to enable it in settings. Otherwise, you can pick up a copy on <a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>the Expedition Store</a>.</div>}
        {!horrorError &&
          <div>
            <Picker label="Adventurers" value={this.props.settings.numPlayers} onDelta={(i: number)=>this.props.onPlayerDelta(this.props.settings.numPlayers, i)}>
              {!playersAllowed && `Quest requires ${quest.minplayers} - ${quest.maxplayers} players.`}
            </Picker>
            <Checkbox label="Multitouch" value={this.props.settings.multitouch} onChange={this.props.onMultitouchChange}>
              {(this.props.settings.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
            </Checkbox>
          </div>
        }
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
  remotePlayStats: MultiplayerCounters;
};

export interface DialogsDispatchProps {
  onExitQuest: () => void;
  onExitMultiplayer: () => void;
  onExpansionSelect: (contentSets: ContentSetsType) => void;
  onFeedbackChange: (text: string) => void;
  onFeedbackSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onMultitouchChange: (v: boolean) => void;
  onPlayerDelta: (numPlayers: number, delta: number) => void;
  onReportErrorSubmit: (error: string, quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onReportQuestSubmit: (quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) => void;
  onSendMultiplayerReport: (user: UserState, quest: QuestDetails, stats: MultiplayerCounters) => void;
  onRequestClose: () => void;
  playQuest: (quest: QuestDetails) => void;
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
      <ExitMultiplayerDialog
        open={props.dialog && props.dialog.open === 'EXIT_REMOTE_PLAY'}
        onExitMultiplayer={props.onExitMultiplayer}
        onRequestClose={props.onRequestClose}
      />
      <MultiplayerStatusDialog
        open={props.dialog && props.dialog.open === 'MULTIPLAYER_STATUS'}
        stats={props.remotePlayStats}
        user={props.user}
        questDetails={props.quest.details}
        onSendReport={props.onSendMultiplayerReport}
        onRequestClose={props.onRequestClose}
      />
      <FeedbackDialog
        open={props.dialog && props.dialog.open === 'FEEDBACK'}
        onFeedbackChange={props.onFeedbackChange}
        onFeedbackSubmit={props.onFeedbackSubmit}
        onRequestClose={props.onRequestClose}
        quest={props.quest}
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
        quest={props.quest}
        settings={props.settings}
        user={props.user}
        userFeedback={props.userFeedback}
      />
      <ReportQuestDialog
        open={props.dialog && props.dialog.open === 'REPORT_QUEST'}
        onFeedbackChange={props.onFeedbackChange}
        onReportQuestSubmit={props.onReportQuestSubmit}
        onRequestClose={props.onRequestClose}
        quest={props.quest}
        settings={props.settings}
        user={props.user}
        userFeedback={props.userFeedback}
      />
      <SetPlayerCountDialog
        open={props.dialog && props.dialog.open === 'SET_PLAYER_COUNT'}
        onMultitouchChange={props.onMultitouchChange}
        onPlayerDelta={props.onPlayerDelta}
        onRequestClose={props.onRequestClose}
        playQuest={props.playQuest}
        quest={props.quest.details}
        settings={props.settings}
      />
    </span>
  );
}

export default Dialogs;
