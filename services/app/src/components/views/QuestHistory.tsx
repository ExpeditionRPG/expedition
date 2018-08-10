import * as React from 'react';
import {UserQuestInstance, UserQuestsType} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export interface StateProps {
  played: UserQuestsType;
}

export interface DispatchProps {
  onSelect: (selected: UserQuestInstance) => void;
  onReturn: () => any;
}

interface Props extends StateProps, DispatchProps {}

const QuestHistory = (props: Props): JSX.Element => {
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
    <Card title="Quest History">
      {items}
    </Card>
  );
};

export default QuestHistory;
