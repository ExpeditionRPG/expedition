import * as React from 'react'
import Card from '../base/Card'
import Button from '../base/Button'
import {SettingsType, UserState} from '../../reducers/StateTypes'
import {QuestDetails} from '../../reducers/QuestTypes'
import {openWindow} from '../../Globals'

export interface FeaturedQuestsStateProps {
  quests: QuestDetails[];
  settings: SettingsType;
  user: UserState;
}

export interface FeaturedQuestsDispatchProps {
  onTools: () => any;
  onSavedQuests: () => any;
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
        <Button onClick={() => props.onQuestSelect(quest)} key={index} id={'quest'+index.toString()}>
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
      {!props.settings.simulator && <Button onClick={() => props.onSearchSelect(props.user, props.settings)} id="morequests">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/book_small.svg"/>More Quests</div>
          <div className="summary">Explore and play community-written quests.</div>
        </div>
      </Button>
      }
      {!props.settings.simulator && props.settings.experimental &&
        <Button onClick={()=>props.onSavedQuests()} id="saved">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/compass_small.svg"/>Saved Quests - Beta</div>
        </div>
      </Button>
      }
      <Button onClick={()=>props.onTools()} id="tools">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/roll_small.svg"/>Tools</div>
        </div>
      </Button>
      <Button onClick={()=>openWindow('https://expeditiongame.com/store?utm_source=app')}>
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/loot_small.svg"/>Shop</div>
        </div>
      </Button>
    </Card>
  );
}

export default FeaturedQuests;
