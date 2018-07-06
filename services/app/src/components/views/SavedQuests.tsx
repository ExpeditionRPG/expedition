import * as React from 'react';
import {SavedQuestMeta} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export interface SavedQuestsStateProps {
  saved: SavedQuestMeta[];
}

export interface SavedQuestsDispatchProps {
  onSelect: (selected: SavedQuestMeta) => void;
}

export interface SavedQuestsProps extends SavedQuestsStateProps, SavedQuestsDispatchProps {}

const SavedQuests = (props: SavedQuestsProps): JSX.Element => {
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
};

export default SavedQuests;
