import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {SettingsType} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';

export interface StateProps {
  quests: Quest[];
  settings: SettingsType;
}

export interface DispatchProps {
  onQuestSelect: (quest: Quest) => void;
  onCustomCombatSelect: (settings: SettingsType) => void;
  onReturn: () => void;
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
    <Card title="GM's Corner" icon="gm_corner" onReturn={props.onReturn}>
      {items}
      <Button id="selectCustomCombat" onClick={() => props.onCustomCombatSelect(props.settings)}>
        <div className="questButtonWithIcon">
          <div className="title">Custom Combat</div>
          <div className="summary">You tell the story; the app runs the combat.</div>
        </div>
      </Button>
    </Card>
  );
};

export default GMCorner;
