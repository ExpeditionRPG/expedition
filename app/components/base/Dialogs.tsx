import * as React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Checkbox from './Checkbox'
import Picker from './Picker'
import {MultiplayerCounters} from '../../Multiplayer'
import {ContentSetsType, DialogState, QuestState, SavedQuestMeta, SettingsType, UserState, UserFeedbackState} from '../../reducers/StateTypes'
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
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Exit quest?</DialogTitle>
        <DialogContent className="dialog">
          <p>Tapping exit will lose your place in the quest and return you to the home screen.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.props.onExitQuest()}>Exit</Button>
        </DialogActions>
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
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Exit Multiplayer?</DialogTitle>
        <DialogContent className="dialog">
          <p>Tapping exit will disconnect you from your peers and return you to the home screen.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>,
          <Button className="primary" onClick={() => this.props.onExitMultiplayer()}>Exit</Button>
        </DialogActions>
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

      // TODO: autoScrollBodyContent={true} ???
    return (
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Multiplayer Stats</DialogTitle>
        <DialogContent className="dialog">
          <p>Here's some multiplayer debugging information:</p>
          {stats}
          <p>
            If you're experiencing problems with multiplayer, please
            tap "Send Report" below to send a log to the Expedition team. Thanks!
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>,
          <Button className="primary" onClick={() => this.props.onSendReport(this.props.user, this.props.questDetails, this.props.stats)}>Send Report</Button>
        </DialogActions>
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
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Choose Game</DialogTitle>
        <DialogContent className="dialog">
          <Button className="primary large" onClick={() => this.props.onExpansionSelect({horror: false})}>Expedition</Button>
          <br/>
          <br/>
          <Button className="primary large" onClick={() => this.props.onExpansionSelect({horror: true})}><span className="line">Expedition</span> <span className="line">+ The Horror</span></Button>
          <p style={{textAlign: 'center', marginTop: '1.5em'}}>This will only appear once, but you can always change it in Settings.</p>
          <p style={{textAlign: 'center', marginTop: '1.5em'}}>Don't have the cards? <strong><a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>Get a copy</a></strong>.</p>
        </DialogContent>
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
  // TODO TextField underlineShow={false}
  render(): JSX.Element {
    return (
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Send Feedback</DialogTitle>
        <DialogContent className="dialog">
          <p>Thank you for taking the time to give us feedback! If you've encountered a bug, please include the steps that you can take to reproduce the issue.</p>
          <TextField
            className="textfield"
            fullWidth={true}
            helperText="Your feedback here"
            multiline={true}
            onChange={(e: any) => this.props.onFeedbackChange(e.target.value)}
            rows={3}
            rowsMax={6}
            value={this.props.userFeedback.text}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.props.onFeedbackSubmit(this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>Submit</Button>
        </DialogActions>
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
    // TODO TextField underlineShow={false}
    return (
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Report Error</DialogTitle>
        <DialogContent className="dialog">
          <p>Thank you for taking the time to report an error! What were you doing when the error occurred?</p>
          <TextField
            className="textfield"
            fullWidth={true}
            helperText="What you were doing at the time of the error"
            multiline={true}
            onChange={(e: any) => this.props.onFeedbackChange(e.target.value)}
            rows={3}
            rowsMax={6}
            value={this.props.userFeedback.text}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.props.onReportErrorSubmit(this.props.error, this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>Submit</Button>
        </DialogActions>
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
    // TODO TextField underlineShow={false}
    return (
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>Report Quest</DialogTitle>
        <DialogContent className="dialog">
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
            helperText="Describe the issue"
            multiline={true}
            onChange={(e: any) => this.props.onFeedbackChange(e.target.value)}
            rows={3}
            rowsMax={6}
            value={this.props.userFeedback.text}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.props.onReportQuestSubmit(this.props.quest, this.props.settings, this.props.user, this.props.userFeedback)}>Submit</Button>
        </DialogActions>
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

    const contents = (horrorError)
      ? (<div className="error">
          The Horror expansion is required to play this quest.
          If you have it, make sure to enable it in settings.
          Otherwise, you can pick up a copy on
          <a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>the Expedition Store</a>.
        </div>)
      : (<div>
          <Picker label="Adventurers" value={this.props.settings.numPlayers} onDelta={(i: number)=>this.props.onPlayerDelta(this.props.settings.numPlayers, i)}>
            {!playersAllowed && `Quest requires ${quest.minplayers} - ${quest.maxplayers} players.`}
          </Picker>
          <Checkbox label="Multitouch" value={this.props.settings.multitouch} onChange={this.props.onMultitouchChange}>
            {(this.props.settings.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
          </Checkbox>
        </div>);
    return (
      <Dialog open={Boolean(this.props.open)}>
        <DialogTitle>{horrorError ? 'Expansion Required' : 'How many players?'}</DialogTitle>
        <DialogContent className="dialog">
          {contents}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>
          {!horrorError && <Button disabled={!playersAllowed} className="primary" onClick={() => this.props.playQuest(this.props.quest)}>Play</Button>}
        </DialogActions>
      </Dialog>
    );
  }
}

interface DeleteSavedQuestDialogProps extends React.Props<any> {
  savedQuest: SavedQuestMeta;
  onDeleteSavedQuest: (savedQuest: SavedQuestMeta) => void;
  onRequestClose: () => void;
  open: boolean;
}

export class DeleteSavedQuestDialog extends React.Component<DeleteSavedQuestDialogProps, {}> {
  render(): JSX.Element {
    return (
      <Dialog
        open={Boolean(this.props.open)}
      >
        <DialogTitle>Delete saved quest?</DialogTitle>
        <DialogContent className="dialog"></DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onRequestClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.props.onDeleteSavedQuest(this.props.savedQuest)}>Delete</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export interface DialogsStateProps {
  dialog: DialogState;
  quest: QuestState;
  selectedSave: SavedQuestMeta;
  settings: SettingsType;
  user: UserState;
  userFeedback: UserFeedbackState;
  remotePlayStats: MultiplayerCounters;
};

export interface DialogsDispatchProps {
  onDeleteSavedQuest: (savedQuest: SavedQuestMeta) => void;
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
      <DeleteSavedQuestDialog
        savedQuest={props.selectedSave}
        open={props.dialog && props.dialog.open === 'DELETE_SAVED_QUEST'}
        onDeleteSavedQuest={props.onDeleteSavedQuest}
        onRequestClose={props.onRequestClose}
      />
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
