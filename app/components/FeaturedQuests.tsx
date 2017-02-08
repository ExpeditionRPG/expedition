import * as React from 'react'
import theme from '../theme'
import Card from './base/Card'
import Button from './base/Button'
import {UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

declare var window: any;

export interface FeaturedQuestsStateProps {
  players: number;
  quests: QuestDetails[];
  user: UserState;
}

export interface FeaturedQuestsDispatchProps {
  onAdvancedPlay: () => any;
  onSearchSelect: (user: UserState, players: number) => any;
  onQuestSelect: (quest: QuestDetails) => any;
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
      <Button onTouchTap={() => props.onSearchSelect(props.user, props.players)}>
        <div className="advanced_play">
          <div className="title"><img className="inline_icon" src="images/book_small.svg"/>Community Quests</div>
          <div className="summary">Explore and play quests written by adventurers around the world!</div>
        </div>
      </Button>
      <Button onTouchTap={()=>props.onAdvancedPlay()}>
        <div className="advanced_play">
          <div className="title"><img className="inline_icon" src="images/roll_small.svg"/>Advanced Play</div>
          <div className="summary">Additional game modes for Expedition veterans.</div>
        </div>
      </Button>
    </Card>
  );
}

export default FeaturedQuests;
