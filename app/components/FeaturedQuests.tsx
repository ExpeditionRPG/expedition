import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {SettingsType, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

export interface FeaturedQuestsStateProps {
  quests: QuestDetails[];
  settings: SettingsType;
  user: UserState;
}

export interface FeaturedQuestsDispatchProps {
  onTools: () => any;
  onSearchSelect: (user: UserState, settings: SettingsType) => any;
  onQuestSelect: (quest: QuestDetails) => any;
}

export interface FeaturedQuestsProps extends FeaturedQuestsStateProps, FeaturedQuestsDispatchProps {}

const FeaturedQuests = (props: FeaturedQuestsProps): JSX.Element => {
  const items: JSX.Element[] = props.quests
    .filter((quest: QuestDetails): boolean => {
      return (!quest.expansionhorror || props.settings.contentSets.horror);
    })
    .map((quest: QuestDetails, index: number): JSX.Element => {
      return (
        <Button onTouchTap={() => props.onQuestSelect(quest)} key={index} remoteID={'quest'+index.toString()}>
          <div className="questButton">
            <div className="title">{quest.title}</div>
            <div className="summary">{quest.summary}</div>
          </div>
        </Button>
      );
    });

  return (
    <Card title="Select Your Quest" icon="adventurer">
      {items}
      <Button onTouchTap={() => props.onSearchSelect(props.user, props.settings)} remoteID="morequests">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/book_small.svg"/>More Quests</div>
          <div className="summary">Explore and play community-written quests.</div>
        </div>
      </Button>
      <Button onTouchTap={()=>props.onTools()} remoteID="tools">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/roll_small.svg"/>Tools</div>
        </div>
      </Button>
    </Card>
  );
}

export default FeaturedQuests;
