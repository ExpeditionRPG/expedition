import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {SettingsType} from '../../reducers/StateTypes';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';

export interface StateProps {
  quests: Quest[];
  settings: SettingsType;
}

export interface DispatchProps {
  onQuestSelect: (quest: Quest) => any;
}

export interface Props extends StateProps, DispatchProps {}

const GMCorner = (props: Props): JSX.Element => {
  const items: JSX.Element[] = props.quests
    .filter((quest: Quest): boolean => {
      return (!quest.expansionhorror || props.settings.contentSets.horror)
          && (!quest.expansionfuture || props.settings.contentSets.future);
    })
    .map((quest: Quest, i: number): JSX.Element => {
      return (<QuestButtonContainer key={i} id={`quest${i}`} quest={quest} onClick={() => props.onQuestSelect(quest)}/>);
    });

  return (
    <Card title="GM's Corner" icon="gm_corner" onReturn={null}>
      {items}
    </Card>
  );
};

export default GMCorner;
