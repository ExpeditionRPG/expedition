import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {formatPlayPeriod} from '../../Format';
import {SavedQuestMeta, SettingsType} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import StarRating from '../base/StarRating';

const Moment = require('moment');
const pluralize = require('pluralize');

export interface StateProps {
  settings: SettingsType;
  quest: Quest | null;
  lastPlayed: Date | null;
  savedInstances: SavedQuestMeta[];
  isDirectLinked: boolean;
}

export interface DispatchProps {
  onPlay: (quest: Quest, isDirectLinked: boolean) => void;
  onPlaySaved: (id: string, ts: number) => void;
  onSave: (quest: Quest) => void;
  onDeleteOffline: (id: string, ts: number) => void;
  onDeleteConfirm: (quest: Quest, ts: number) => void;
  onReturn: () => void;
}

export interface Props extends StateProps, DispatchProps {}

function renderRequirementsRow(quest: Quest): JSX.Element|null {
  const requires = [];
  if (quest.expansionhorror) {
    requires.push(<div key="horror"><img className="inline_icon" src="images/horror_small.svg"/>The Horror</div>);
  }
  if (quest.expansionfuture) {
    requires.push(<div key="future"><img className="inline_icon" src="images/future_small.svg"/>The Future</div>);
  }
  if (quest.requirespenpaper) {
    requires.push(<div key="penpaper"><img className="inline_icon" src="images/book_small.svg"/> Pen and Paper</div>);
  }

  if (requires.length === 0) {
    return null;
  }

  return <tr><th>Requires</th><td>{requires}</td></tr>;
}

function renderSaves(props: Props): JSX.Element|null {
  const saves = props.savedInstances.filter((s) => (s.pathLen || 0) !== 0);
  if (!props.settings.experimental || saves.length === 0) {
    return null;
  }
  const quest = props.quest;
  if (!quest) {
    return <span/>;
  }

  saves.sort((a, b) => b.ts - a.ts);

  const buttons = saves.map((s, i) => {
    return (
      <div key={i} className="savedQuest">
        <Button onClick={(e) => props.onPlaySaved(s.details.id, s.ts)} id={`playsave${i}`}>{Moment(s.ts).fromNow()} ({(s.pathLen === undefined) ? 'unknown position' : `${s.pathLen.toString()} ${pluralize('choice', s.pathLen || 0)}`})</Button>
        <IconButton onClick={(e) => props.onDeleteConfirm(quest, s.ts)} id={`deletesave${i}`}>
          <CloseIcon/>
        </IconButton>
      </div>
    );
  });
  return (
    <span>
      <h3>Saves</h3>
      {buttons}
    </span>
  );
}

const QuestPreview = (props: Props): JSX.Element => {
  const quest = props.quest;
  if (!quest) {
    return <Card title="Quest Preview">Loading...</Card>;
  }

  const lastSaved = props.savedInstances.filter((s) => (s.pathLen || 0) !== 0).map((s) => s.ts).reduce((a, b) => Math.max(a, b), 0) || null;
  let offlineTS: number|null = null;
  for (const si of props.savedInstances) {
    if (si.pathLen === 0) {
      offlineTS = si.ts;
      break;
    }
  }

  const actions: JSX.Element[] = [];

  if (offlineTS !== null && !props.isDirectLinked) {
    actions.push(<Button key="play" className="bigbutton" onClick={(e) => props.onPlaySaved(quest.id, offlineTS || 0)} id="play">Play</Button>);
  } else {
    actions.push(<Button key="play" className="bigbutton" onClick={(e) => props.onPlay(quest, props.isDirectLinked)} id="play">Play</Button>);
  }

  if (props.settings.experimental) {
    if (props.savedInstances.length > 0 && lastSaved !== null) {
      actions.push(<Button key="continue" onClick={(e) => props.onPlaySaved(quest.id, lastSaved)} id="playlastsave">Continue from last save</Button>);
    }

    // Allow us to save non-local quests for offline play
    if (!quest.publishedurl.startsWith('quests/')) {
      let offlineButton: JSX.Element|null = <Button key="offlinesave" onClick={(e) => props.onSave(quest)} id="offlinesave">Save for offline play</Button>;
      if (offlineTS !== null) {
        offlineButton = <Button key="offlinedelete" onClick={(e) => props.onDeleteOffline(quest.id, offlineTS || 0)} id="offlinedelete">Clear offline state</Button>;
      }
      actions.push(offlineButton);
    }
  }

  actions.push(<Button key="back" id="searchDetailsBackButton" onClick={(e) => props.onReturn()}>Back</Button>);

  const ratingAvg = quest.ratingavg || 0;
  return (
    <Card title="Quest Preview">
      <div className="searchDetails">
        <h2>{quest.title}</h2>
        <div>{quest.summary}</div>
        <div className="author">by {quest.author}</div>
        {lastSaved !== null && <div className="summary">Last saved {Moment(lastSaved).fromNow()}</div>}
        {(quest.ratingcount && quest.ratingcount >= 1) ? <StarRating readOnly={true} value={+ratingAvg} quantity={quest.ratingcount}/> : ''}
        <div className="indicators">
          {offlineTS && <div className="inline_icon"><img className="inline_icon" src="images/offline_small.svg"/>Available Offline</div>}
          {props.lastPlayed && <div className="inline_icon"><img className="inline_icon" src="images/checkmark_small.svg"/> Last completed {Moment(props.lastPlayed).fromNow()}</div>}
          {quest.official && <div className="inline_icon"><img className="inline_icon" src="images/logo_outline_small.svg"/> Official Quest!</div>}
          {quest.partition === 'expedition-private' && <div className="inline_icon"><img className="inline_icon" src="images/private_small.svg"/> Private Quest</div>}
          {quest.awarded && <div className="inline_icon"><img className="inline_icon" src="images/starcircle_small.svg"/> {quest.awarded}</div>}
        </div>
      </div>
      {actions}
      <div className="searchDetailsExtended">
        <h3>Details</h3>
        <table className="searchDetailsTable">
          <tbody>
            {renderRequirementsRow(quest)}
            <tr><th>Content rating</th><td>{quest.contentrating}</td></tr>
            {quest.mintimeminutes !== undefined && quest.maxtimeminutes !== undefined &&
              <tr><th>Play time</th><td>{formatPlayPeriod(quest.mintimeminutes, quest.maxtimeminutes)}</td></tr>
            }
            <tr><th>Players</th><td>{quest.minplayers}-{quest.maxplayers}</td></tr>
            <tr><th>Genre</th><td>{quest.genre}</td></tr>
            <tr><th>Language</th><td>{quest.language}</td></tr>
            <tr><th>Last updated</th><td>{Moment(quest.published).format('MMMM D, YYYY h:mm a')}</td></tr>
          </tbody>
        </table>
      </div>
      {renderSaves(props)}
    </Card>
  );
};

export default QuestPreview;
