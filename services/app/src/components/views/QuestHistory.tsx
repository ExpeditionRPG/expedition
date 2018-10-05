import * as React from 'react';
import {UserQuestInstance, UserQuestsType} from '../../reducers/StateTypes';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';

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
    .map((k: string, i: number): JSX.Element => {
      const h = props.played[k];
      return (
        <QuestButtonContainer key={i} id={`quest${i}`} quest={h.details} onClick={() => props.onSelect(h)}>
          <span className="details">{Moment(h.lastPlayed).fromNow()}</span>
        </QuestButtonContainer>
      );
    });

  return (
    <Card title="Quest History" icon="hourglass" onReturn={null}>
      {items}
    </Card>
  );
};

export default QuestHistory;
