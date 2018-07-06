import * as React from 'react';
import {QuestDetails} from '../../reducers/QuestTypes';
import {SelectionListPhase, UserQuestInstance, UserQuestsType} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export interface QuestHistoryStateProps {
  phase: SelectionListPhase;
  played: UserQuestsType;
  selected: UserQuestInstance|null;
}

export interface QuestHistoryDispatchProps {
  onSelect: (selected: UserQuestInstance) => void;
  onPlay: (details: QuestDetails) => void;
  onReturn: () => any;
}

export interface QuestHistoryProps extends QuestHistoryStateProps, QuestHistoryDispatchProps {}

function renderDetails(props: QuestHistoryProps): JSX.Element {
  const selected = props.selected;
  if (!selected) {
    return <Card title="Quest Details">Loading...</Card>;
  }
  const quest = selected.details;
  const expansions = (quest.expansionhorror) ? <span><img className="inline_icon" src="images/horror_small.svg"/>The Horror</span> : 'None';
  return (
    <Card title="Quest Details">
      <div className="searchDetails">
        <h2>{quest.title}</h2>
        <div>{quest.summary}</div>
        <div className="author">by {quest.author}</div>
        <div className="summary">Last played {Moment(selected.lastPlayed).fromNow()}</div>
      </div>
      <Button className="bigbutton" onClick={(e) => props.onPlay(quest)} id="play">Play</Button>
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

function renderList(props: QuestHistoryProps): JSX.Element {
  if (Object.keys(props.played).length === 0) {
    return (
      <Card title="Quest History">
        <p>You haven't played any quests yet.</p>
      </Card>
    );
  }

  const items: JSX.Element[] = Object.keys(props.played)
    .map((k: string, index: number): JSX.Element => {
      const i = props.played[k];
      console.log(i);
      return (
        <Button onClick={() => props.onSelect(i)} key={index} id={'quest' + index.toString()}>
          <div className="questButton">
            <div className="title">{i.details.title}</div>
            <div className="summary">{Moment(i.lastPlayed).fromNow()}</div>
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

const QuestHistory = (props: QuestHistoryProps): JSX.Element => {
  switch (props.phase) {
    case 'LIST':
      return renderList(props);
    case 'DETAILS':
      return renderDetails(props);
    default:
      throw new Error('Unknown saved quest phase ' + props.phase);
  }
};

export default QuestHistory;
