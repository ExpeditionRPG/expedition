import * as React from 'react'
import theme from '../theme'
import Card from './base/Card'
import Button from './base/Button'
import {QuestDetails} from '../reducers/QuestTypes'

declare var window: any;

export interface FeaturedQuestsStateProps {
  quests: QuestDetails[];
}

export interface FeaturedQuestsDispatchProps {
  onQuestSelect: (quest: QuestDetails) => any;
  onAdvancedPlay: () => any;
}

export interface FeaturedQuestsProps extends FeaturedQuestsStateProps, FeaturedQuestsDispatchProps {}

const FeaturedQuests = (props: FeaturedQuestsProps): JSX.Element => {
  let items: JSX.Element[] = props.quests.map((quest: QuestDetails, index: number): JSX.Element => {
    return (
      <Button onTouchTap={() => props.onQuestSelect(quest)} key={index}>
        <div className="featured_quest">
          <div className="title">{quest.title}</div>
          <div className="summary">{quest.summary}</div>
        </div>
      </Button>
    );
  });

  return (
    <Card title="Featured Quests" icon="adventurer">
      <p>
        Select a quest below to get started, or click Advanced Play below for more options.
      </p>
      {items}
      <Button onTouchTap={()=>props.onAdvancedPlay()}>Advanced Play</Button>
    </Card>
  );
}

export default FeaturedQuests;
