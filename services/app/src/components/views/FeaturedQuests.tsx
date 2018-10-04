import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

export interface StateProps {
  quests: Quest[];
  settings: SettingsType;
  user: UserState;
}

export interface DispatchProps {
  onQuestSelect: (quest: Quest) => any;
}

export interface Props extends StateProps, DispatchProps {}

const Tutorials = (props: Props): JSX.Element => {
  const items: JSX.Element[] = props.quests
    .filter((quest: Quest): boolean => {
      return (!quest.expansionhorror || props.settings.contentSets.horror)
          && (!quest.expansionfuture || props.settings.contentSets.future);
    })
    .map((quest: Quest, index: number): JSX.Element => {
      return (
        <Button onClick={() => props.onQuestSelect(quest)} key={index} id={'quest' + index.toString()}>
          <div className="questButton">
            <div className="title">{quest.title}</div>
            <div className="summary">{quest.summary}</div>
          </div>
        </Button>
      );
    });

  return (
    <Card title="Tutorial Quests" icon="helper" onReturn={null}>
      {items}
    </Card>
  );
};

export default Tutorials;
