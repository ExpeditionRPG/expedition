import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {Expansion} from '../../Constants';
import {ContentSetsType} from '../../reducers/StateTypes';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';

export interface StateProps {
  quests: Quest[];
  contentSets: Set<keyof ContentSetsType>;
  title: string;
  icon: string;
}

export interface DispatchProps {
  onQuestSelect: (quest: Quest) => any;
  onReturn: () => void;
}

export interface Props extends StateProps, DispatchProps {}

const QuestListCard = (props: Props): JSX.Element => {
  const items: JSX.Element[] = props.quests
    .filter((quest: Quest): boolean => {
      return (!quest.expansionhorror || props.contentSets.has(Expansion.horror))
          && (!quest.expansionfuture || props.contentSets.has(Expansion.future))
          && (!quest.expansionscarredlands || props.contentSets.has(Expansion.scarredlands));
    })
    .map((quest: Quest, i: number): JSX.Element => {
      return (<QuestButtonContainer key={i} id={`quest${i}`} quest={quest} onClick={() => props.onQuestSelect(quest)}/>);
    });

  return (
    <Card title={props.title} icon={props.icon} onReturn={props.onReturn}>
      {items}
    </Card>
  );
};

export default QuestListCard;
