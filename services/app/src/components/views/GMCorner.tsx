import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {ContentSetsType, SettingsType} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';

export interface StateProps {
  quests: Quest[];
  settings: SettingsType;
  contentSets: Set<keyof ContentSetsType>;
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
      return (!quest.expansionhorror || props.contentSets.has('horror'))
          && (!quest.expansionfuture || props.contentSets.has('future'));
    })
    .map((quest: Quest, i: number): JSX.Element => {
      return (<QuestButtonContainer key={i} id={`quest${i}`} quest={quest} onClick={() => props.onQuestSelect(quest)}/>);
    });

  // TODO: Rename to "GM's Corner" after stretch goal achieved, add quests.
  return (
    <Card title="Tools" icon="gm_corner" onReturn={props.onReturn}>
      <Button id="selectCustomCombat" onClick={() => props.onCustomCombatSelect(props.settings)}>
        <div className="questButtonWithIcon">
          <div className="title">Combat Only</div>
          <div className="summary">Tell your own story, and let the app run combat.</div>
        </div>
      </Button>
      {items}
    </Card>
  );
};

export default GMCorner;
