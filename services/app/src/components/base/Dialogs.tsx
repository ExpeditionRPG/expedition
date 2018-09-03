import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {openWindow} from '../../Globals';
import {MultiplayerCounters} from '../../Multiplayer';
import {ContentSetsType, DialogState, FeedbackType, QuestState, SavedQuestMeta, SettingsType, UserState} from '../../reducers/StateTypes';
import Checkbox from './Checkbox';
import Picker from './Picker';

interface ExitQuestDialogProps extends React.Props<any> {
  onClose: () => void;
  onExitQuest: () => void;
  open: boolean;
}

export class ExitQuestDialog extends React.Component<ExitQuestDialogProps, {}> {
  public render(): JSX.Element {
    return (
      <Dialog classes={{paperWidthSm: 'dialog'}} open={Boolean(this.props.open)}>
        <DialogTitle>Exit quest?</DialogTitle>
        <DialogContent className="dialog">
          <p>Tapping exit will lose your place in the quest and return you to the home screen.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.props.onExitQuest()}>Exit</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

interface ExitMultiplayerDialogProps extends React.Props<any> {
  onClose: () => void;
  onExitMultiplayer: () => void;
  open: boolean;
}

export class ExitMultiplayerDialog extends React.Component<ExitMultiplayerDialogProps, {}> {
  public render(): JSX.Element {
    return (
      <Dialog classes={{paperWidthSm: 'dialog'}} open={Boolean(this.props.open)}>
        <DialogTitle>Exit Multiplayer?</DialogTitle>
        <DialogContent className="dialog">
          <p>Tapping exit will disconnect you from your peers and return you to the home screen.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onClose()}>Cancel</Button>,
          <Button className="primary" onClick={() => this.props.onExitMultiplayer()}>Exit</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

interface MultiplayerStatusDialogProps extends React.Props<any> {
  onClose: () => void;
  onSendReport: (user: UserState, quest: Quest, stats: MultiplayerCounters) => void;
  open: boolean;
  questDetails: Quest;
  stats: MultiplayerCounters;
  user: UserState;
}

export class MultiplayerStatusDialog extends React.Component<MultiplayerStatusDialogProps, {}> {
  public render(): JSX.Element {

    const stats = <ul>{
        Object.keys(this.props.stats).map((k, i) => {
          return <li key={i}>{k}: {this.props.stats[k]}</li>;
        })
      }</ul>;

      // TODO: autoScrollBodyContent={true} ???
    return (
      <Dialog classes={{paperWidthSm: 'dialog'}} open={Boolean(this.props.open)}>
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
          <Button onClick={() => this.props.onClose()}>Cancel</Button>,
          <Button className="primary" onClick={() => this.props.onSendReport(this.props.user, this.props.questDetails, this.props.stats)}>Send Report</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

interface ExpansionSelectDialogProps extends React.Props<any> {
  onExpansionSelect: (contentSets: ContentSetsType) => void;
  open: boolean;
}

export class ExpansionSelectDialog extends React.Component<ExpansionSelectDialogProps, {}> {
  public render(): JSX.Element {
    return (
      <Dialog classes={{paperWidthSm: 'dialog'}} open={Boolean(this.props.open)}>
        <DialogTitle>Choose game</DialogTitle>
        <DialogContent className="dialog">
          <Button className="primary large" onClick={() => this.props.onExpansionSelect({horror: false, future: false})}>Base Game</Button>
          <br/>
          <br/>
          <Button className="primary large" onClick={() => this.props.onExpansionSelect({horror: true})}>Base + Horror</Button>
          <br/>
          <br/>
          <Button className="primary large" onClick={() => this.props.onExpansionSelect({horror: true, future: true})}>Base + Horror + Future</Button>
          <p style={{textAlign: 'center', marginTop: '1.5em'}}>This will only appear once, but you can change it at any time in Settings.</p>
          <p style={{textAlign: 'center', marginTop: '1.5em'}}>Don't have the cards? <strong><a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>Get a copy</a></strong>.</p>
        </DialogContent>
      </Dialog>
    );
  }
}

interface TextAreaDialogProps extends React.Props<any> {
  onClose: () => void;
  onFeedbackSubmit: (type: FeedbackType, quest: QuestState, settings: SettingsType, user: UserState, text: string) => void;
  open: boolean;
  quest: QuestState;
  settings: SettingsType;
  user: UserState;
}
class TextAreaDialog<T extends TextAreaDialogProps> extends React.Component<T, {}> {
  protected title: string;
  protected content: JSX.Element;
  protected helperText: string;

  public state: {text: string};

  constructor(props: T) {
    super(props);
    this.state = {text: ''};
  }

  public onSubmit() {
    throw new Error('Unimplemented');
  }

  public render(): JSX.Element {
    return (
      <Dialog classes={{paperWidthSm: 'dialog'}} open={Boolean(this.props.open)}>
        <DialogTitle>{this.title}</DialogTitle>
        <DialogContent className="dialog">
          {this.content}
          <TextField
            className="textfield"
            fullWidth={true}
            helperText={this.helperText}
            multiline={true}
            onChange={(e: any) => this.setState({text: e.target.value})}
            onFocus={(e: any) => e.target.scrollIntoView()}
            rows={3}
            rowsMax={6}
            value={this.state.text}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onClose()}>Cancel</Button>
          <Button className="primary" onClick={() => this.onSubmit()}>Submit</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export class FeedbackDialog extends TextAreaDialog<TextAreaDialogProps> {
  constructor(props: TextAreaDialogProps) {
    super(props);
    this.title = 'Send Feedback';
    this.content = <p>Thank you for taking the time to give us feedback! If you've encountered a bug, please include the steps that you can take to reproduce the issue.</p>;
    this.helperText = 'Your feedback here';
  }

  public onSubmit() {
    this.props.onFeedbackSubmit('feedback', this.props.quest, this.props.settings, this.props.user, this.state.text);
  }
}

interface ReportErrorDialogProps extends TextAreaDialogProps {
  error: string;
}
export class ReportErrorDialog extends TextAreaDialog<ReportErrorDialogProps> {
  constructor(props: ReportErrorDialogProps) {
    super(props);
    this.title = 'Report Error';
    this.content = <p>Thank you for taking the time to report an error! What were you doing when the error occurred?</p>;
    this.helperText = 'What you were doing at the time of the error';
  }

  public onSubmit() {
    this.props.onFeedbackSubmit('report_error', this.props.quest, this.props.settings, this.props.user, this.state.text + '... Error: ' + this.props.error);
  }
}

export class ReportQuestDialog extends TextAreaDialog<TextAreaDialogProps> {
  constructor(props: TextAreaDialogProps) {
    super(props);
    this.title = 'Report Quest';
    this.content = (
      <span>
        <p>You're reporting an issue with <i>{this.props.quest.details.title}</i>.</p>
        <p>You should report a quest (instead of reviewing it at the end of the quest) if it is:</p>
        <ul>
          <li>Offensive or inappropriate for the age level it claimed to be.</li>
          <li>Broken or buggy.</li>
          <li>Incomplete or missing sections.</li>
        </ul>
      </span>
    );
    this.helperText = 'Describe the issue';
  }

  public onSubmit() {
    this.props.onFeedbackSubmit('report_quest', this.props.quest, this.props.settings, this.props.user, this.state.text);
  }
}

interface SetPlayerCountDialogProps extends React.Props<any> {
  onClose: () => void;
  onMultitouchChange: (v: boolean) => void;
  onPlayerDelta: (numPlayers: number, delta: number) => void;
  open: boolean;
  playQuest: (quest: Quest) => void;
  quest: Quest;
  settings: SettingsType;
}

export class SetPlayerCountDialog extends React.Component<SetPlayerCountDialogProps, {}> {
  public render(): JSX.Element {
    const quest = this.props.quest;
    let playersAllowed = true;
    if (quest.minplayers && quest.maxplayers) {
      playersAllowed = (this.props.settings.numPlayers >= quest.minplayers &&
        this.props.settings.numPlayers <= quest.maxplayers);
    }
    let contents = <div>
        <Picker label="Adventurers" value={this.props.settings.numPlayers} onDelta={(i: number) => this.props.onPlayerDelta(this.props.settings.numPlayers, i)}>
          {!playersAllowed && `Quest requires ${quest.minplayers} - ${quest.maxplayers} players.`}
        </Picker>
        <Checkbox label="Multitouch" value={this.props.settings.multitouch} onChange={this.props.onMultitouchChange}>
          {(this.props.settings.multitouch) ? 'All players must hold their finger on the screen to end combat.' : 'A single tap will end combat.'}
        </Checkbox>
      </div>;
    const futureError = quest.expansionfuture && !this.props.settings.contentSets.future;
    const horrorError = quest.expansionhorror && !this.props.settings.contentSets.horror;
    if (futureError) {
      contents = <div className="error">
          The Future expansion is required to play this quest.
          If you have it, make sure to enable it in settings.
          Otherwise, you can pick up a copy on
          <a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>the Expedition Store</a>.
        </div>;
    } else if (horrorError) {
      contents = <div className="error">
          The Horror expansion is required to play this quest.
          If you have it, make sure to enable it in settings.
          Otherwise, you can pick up a copy on
          <a href="#" onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>the Expedition Store</a>.
        </div>;
    }
    return (
      <Dialog classes={{paperWidthSm: 'dialog'}} open={Boolean(this.props.open)}>
        <DialogTitle>{horrorError || futureError ? 'Expansion Required' : 'How many players?'}</DialogTitle>
        <DialogContent className="dialog">
          {contents}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onClose()}>Cancel</Button>
          {!horrorError && <Button disabled={!playersAllowed} className="primary" onClick={() => this.props.playQuest(this.props.quest)}>Play</Button>}
        </DialogActions>
      </Dialog>
    );
  }
}

interface DeleteSavedQuestDialogProps extends React.Props<any> {
  onClose: () => void;
  onDeleteSavedQuest: (savedQuest: SavedQuestMeta) => void;
  open: boolean;
  savedQuest: SavedQuestMeta|null;
}

export class DeleteSavedQuestDialog extends React.Component<DeleteSavedQuestDialogProps, {}> {
  public render() {
    const savedQuest = this.props.savedQuest;
    return (
      <Dialog
        open={Boolean(this.props.open)}
      >
        <DialogTitle>Delete saved quest?</DialogTitle>
        <DialogContent className="dialog"></DialogContent>
        <DialogActions>
          <Button onClick={() => this.props.onClose()}>Cancel</Button>
          <Button className="primary" onClick={() => {
            if (savedQuest === null) {
              throw new Error('missing saved quest information');
            }
            this.props.onDeleteSavedQuest(savedQuest);
          }}>Delete</Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export interface StateProps {
  dialog: DialogState;
  multiplayerStats: MultiplayerCounters;
  quest: QuestState;
  selectedSave: SavedQuestMeta|null;
  settings: SettingsType;
  user: UserState;
}

export interface DispatchProps {
  onClose: () => void;
  onDeleteSavedQuest: (savedQuest: SavedQuestMeta) => void;
  onExitMultiplayer: () => void;
  onExitQuest: () => void;
  onExpansionSelect: (contentSets: ContentSetsType) => void;
  onFeedbackSubmit: (type: FeedbackType, quest: QuestState, settings: SettingsType, user: UserState, text: string) => void;
  onMultitouchChange: (v: boolean) => void;
  onPlayerDelta: (numPlayers: number, delta: number) => void;
  onSendMultiplayerReport: (user: UserState, quest: Quest, stats: MultiplayerCounters) => void;
  playQuest: (quest: Quest) => void;
}

interface Props extends StateProps, DispatchProps {}

const Dialogs = (props: Props): JSX.Element => {
  return (
    <span>
      <DeleteSavedQuestDialog
        savedQuest={props.selectedSave}
        open={props.dialog && props.dialog.open === 'DELETE_SAVED_QUEST'}
        onDeleteSavedQuest={props.onDeleteSavedQuest}
        onClose={props.onClose}
      />
      <ExitQuestDialog
        open={props.dialog && props.dialog.open === 'EXIT_QUEST'}
        onExitQuest={props.onExitQuest}
        onClose={props.onClose}
      />
      <ExpansionSelectDialog
        open={props.dialog && props.dialog.open === 'EXPANSION_SELECT'}
        onExpansionSelect={(contentSets: ContentSetsType) => props.onExpansionSelect(contentSets)}
      />
      <ExitMultiplayerDialog
        open={props.dialog && props.dialog.open === 'EXIT_REMOTE_PLAY'}
        onExitMultiplayer={props.onExitMultiplayer}
        onClose={props.onClose}
      />
      <MultiplayerStatusDialog
        open={props.dialog && props.dialog.open === 'MULTIPLAYER_STATUS'}
        stats={props.multiplayerStats}
        user={props.user}
        questDetails={props.quest.details}
        onSendReport={props.onSendMultiplayerReport}
        onClose={props.onClose}
      />
      <FeedbackDialog
        open={props.dialog && props.dialog.open === 'FEEDBACK'}
        onFeedbackSubmit={props.onFeedbackSubmit}
        onClose={props.onClose}
        quest={props.quest}
        settings={props.settings}
        user={props.user}
      />
      <ReportErrorDialog
        error={props.dialog && props.dialog.message || ''}
        open={props.dialog && props.dialog.open === 'REPORT_ERROR'}
        onFeedbackSubmit={props.onFeedbackSubmit}
        onClose={props.onClose}
        quest={props.quest}
        settings={props.settings}
        user={props.user}
      />
      <ReportQuestDialog
        open={props.dialog && props.dialog.open === 'REPORT_QUEST'}
        onFeedbackSubmit={props.onFeedbackSubmit}
        onClose={props.onClose}
        quest={props.quest}
        settings={props.settings}
        user={props.user}
      />
      <SetPlayerCountDialog
        open={props.dialog && props.dialog.open === 'SET_PLAYER_COUNT'}
        onMultitouchChange={props.onMultitouchChange}
        onPlayerDelta={props.onPlayerDelta}
        onClose={props.onClose}
        playQuest={props.playQuest}
        quest={props.quest.details}
        settings={props.settings}
      />
    </span>
  );
};

export default Dialogs;
