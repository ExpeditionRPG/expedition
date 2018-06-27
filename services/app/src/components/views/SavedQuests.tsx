import * as React from 'react';
import {SavedQuestMeta, SavedQuestsPhase} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export interface SavedQuestsStateProps {
  phase: SavedQuestsPhase;
  saved: SavedQuestMeta[];
  selected: SavedQuestMeta|null;
}

export interface SavedQuestsDispatchProps {
  onSelect: (selected: SavedQuestMeta) => void;
  onPlay: (id: string, ts: number) => void;
  onDelete: (selected: SavedQuestMeta) => void;
  onReturn: () => any;
}

export interface SavedQuestsProps extends SavedQuestsStateProps, SavedQuestsDispatchProps {}

function renderDetails(props: SavedQuestsProps): JSX.Element {
  const selected = props.selected;
  if (!selected) {
    return <Card title="Saved Quest Details">Loading...</Card>;
  }
  const quest = selected.details;
  const expansions = (quest.expansionhorror) ? <span><img className="inline_icon" src="images/horror_small.svg"/>The Horror</span> : 'None';
  return (
    <Card title="Saved Quest Details">
      <div className="searchDetails">
        <h2>{quest.title}</h2>
        <div>{quest.summary}</div>
        <div className="author">by {quest.author}</div>
        <div className="summary">Saved {Moment(selected.ts).fromNow()}</div>
      </div>
      <Button className="bigbutton" onClick={(e) => props.onPlay(selected.details.id, selected.ts)} id="play">Resume</Button>
      <Button onClick={(e) => props.onDelete(selected)} id="play">Delete save</Button>
      <Button onClick={(e) => props.onReturn()} id="back">Back</Button>
      <div className="searchDetailsExtended">
        <h3>Details</h3>
        <div><strong>Expansions required: </strong>{expansions}</div>
        <div><strong>Content rating:</strong> {quest.contentrating}</div>
        <div><strong>Players:</strong> {quest.minplayers}-{quest.maxplayers}</div>
        <div><strong>Genre:</strong> {quest.genre}</div>
        <div><strong>Last updated: </strong> {Moment(quest.published).format('MMMM D, YYYY')}</div>
      </div>
    </Card>
  );
}

function renderList(props: SavedQuestsProps): JSX.Element {
  if (props.saved.length === 0) {
    return (
      <Card title="Saved Quests">
        <p>You have no saved quests.</p>
        <p>To save your position in a quest, open the top right menu while playing
           and select "Save Quest".</p>
        <p>Quests are saved to your device and are available without an internet
           connection.</p>
      </Card>
    );
  }

  const items: JSX.Element[] = props.saved
    .map((s: SavedQuestMeta, index: number): JSX.Element => {
      return (
        <Button onClick={() => props.onSelect(s)} key={index} id={'quest' + index.toString()}>
          <div className="questButton">
            <div className="title">{s.details.title}</div>
            <div className="summary">{Moment(s.ts).fromNow()}</div>
          </div>
        </Button>
      );
    });

  return (
    <Card title="Saved Quests">
      {items}
    </Card>
  );
}

const SavedQuests = (props: SavedQuestsProps): JSX.Element => {
  switch (props.phase) {
    case 'LIST':
      return renderList(props);
    case 'DETAILS':
      return renderDetails(props);
    default:
      throw new Error('Unknown saved quest phase ' + props.phase);
  }
};

export default SavedQuests;
