import DoneIcon from '@material-ui/icons/Done';
import StarsIcon from '@material-ui/icons/Stars';
import * as React from 'react';
import {formatPlayPeriod} from '../../Format';
import {QuestDetails} from '../../reducers/QuestTypes';
import {SavedQuestMeta, SearchPhase, SearchSettings, SearchState, SettingsType, UserQuestHistory, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';
import StarRating from '../base/StarRating';

const Moment = require('moment');

export interface QuestPreviewStateProps {
  isDirectLinked: boolean;
  quest: QuestDetails | null;
  lastPlayed: Date | null;
  savedTS: number | null;
}

export interface QuestPreviewDispatchProps {
  onPlay: (quest: QuestDetails, isDirectLinked: boolean) => void;
  onPlaySaved: (id: string, ts: number) => void;
  onDeleteConfirm: () => void;
  onReturn: () => void;
}

export interface QuestPreviewProps extends QuestPreviewStateProps, QuestPreviewDispatchProps {}

function renderRequirements(quest: QuestDetails): JSX.Element[] {
  const requires = [];
  if (quest.expansionhorror) {
    requires.push(<span key="horror"><img className="inline_icon" src="images/horror_small.svg"/>The Horror</span>);
  }
  if (quest.requirespenpaper) {
    requires.push(<span key="penpaper"><img className="inline_icon" src="images/book_small.svg"/> Pen and Paper</span>);
  }

  if (requires.length === 0) {
    return [<span key={0}>None</span>];
  }

  const delimited = [];
  for (let i = 0; i < requires.length; i++) {
    delimited.push(requires[i]);
    if (i < requires.length - 1) {
      delimited.push(<span key={i}>,&nbsp;</span>);
    }
  }
  return delimited;
}

const QuestPreview = (props: QuestPreviewProps): JSX.Element => {
  const quest = props.quest;
  if (!quest) {
    return <Card title="Quest Details">Loading...</Card>;
  }

  let actions: JSX.Element;
  const savedTS = props.savedTS;
  if (savedTS !== null) {
    actions = <span>
      <Button className="bigbutton" onClick={(e) => props.onPlaySaved(quest.id, savedTS)} id="play">Resume</Button>
      <Button onClick={(e) => props.onDeleteConfirm()} id="play">Delete save</Button>
      <Button onClick={(e) => props.onReturn()} id="back">Back</Button>
    </span>;
  } else {
    actions = <span>
      <Button className="bigbutton" onClick={(e) => props.onPlay(quest, props.isDirectLinked)} id="play">Play</Button>
      <Button id="searchDetailsBackButton" onClick={(e) => props.onReturn()} >Pick a different quest</Button>
    </span>;
  }

  const ratingAvg = quest.ratingavg || 0;
  return (
    <Card title="Quest Details">
      <div className="searchDetails">
        <h2>{quest.title}</h2>
        <div>{quest.summary}</div>
        <div className="author">by {quest.author}</div>
        {savedTS !== null && <div className="summary">Saved {Moment(savedTS).fromNow()}</div>}
        {(quest.ratingcount && quest.ratingcount >= 1) ? <StarRating readOnly={true} value={+ratingAvg} quantity={quest.ratingcount}/> : ''}
        <div className="indicators">
          {props.lastPlayed && <div className="inline_icon"><DoneIcon className="inline_icon" /> Last played {Moment(props.lastPlayed).fromNow()}</div>}
          {quest.official && <div className="inline_icon"><img className="inline_icon" src="images/compass_small.svg"/> Official Quest!</div>}
          {quest.awarded && <div className="inline_icon"><StarsIcon className="inline_icon" /> {quest.awarded}</div>}
        </div>
      </div>
      {actions}
      <div className="searchDetailsExtended">
        <h3>Details</h3>
        <table className="searchDetailsTable">
          <tbody>
            <tr><th>Requires</th><td>{renderRequirements(quest)}</td></tr>
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
    </Card>
  );
};

export default QuestPreview;
