import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {openWindow} from '../../Globals';
import {CardName, SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

export interface StateProps {
  quests: Quest[];
  settings: SettingsType;
  user: UserState;
}

export interface DispatchProps {
  toCard: (name: CardName) => any;
  onSearchSelect: (user: UserState, settings: SettingsType) => any;
  onQuestSelect: (quest: Quest) => any;
}

export interface Props extends StateProps, DispatchProps {}

const FeaturedQuests = (props: Props): JSX.Element => {
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
        <Button onClick={() => props.toCard('SAVED_QUESTS')} id="saved">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/compass_small.svg"/>Saved & Offline Quests</div>
        </div>
      </Button>
      }
      {!props.settings.simulator &&
        <Button onClick={() => props.toCard('QUEST_HISTORY')} id="history">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/compass_small.svg"/>Quest History</div>
        </div>
      </Button>
      }
      {!props.settings.simulator && <Button onClick={() => props.toCard('ADVANCED')} id="tools">
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/roll_small.svg"/>Tools</div>
        </div>
      </Button>}
      <Button onClick={() => openWindow('https://expeditiongame.com/store?utm_source=app')}>
        <div className="questButtonWithIcon">
          <div className="title"><img className="inline_icon" src="images/loot_small.svg"/>Shop</div>
        </div>
      </Button>
    </Card>
  );
};

export default FeaturedQuests;
