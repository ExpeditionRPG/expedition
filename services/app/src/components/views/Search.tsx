import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {BUNDLED_QUESTS} from '../../Constants';
import {CardName, SearchParams, SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';
import StarRating from '../base/StarRating';
import TextDivider from '../base/TextDivider';

const Moment = require('moment');

export interface StateProps {
  params: SearchParams;
  settings: SettingsType;
  user: UserState;
  results: Quest[];
  searching: boolean;
}

export interface DispatchProps {
  toCard: (name: CardName) => void;
  onReturn: () => void;
  onQuest: (quest: Quest) => void;
}

export interface Props extends StateProps, DispatchProps {}

function renderDetails(quest: Quest, order?: string): JSX.Element|null {
  const subfield = (order && order.substring(1)) || undefined;
  if (!subfield) {
    return null;
  }
  const ratingCount = quest.ratingcount || 0;
  const ratingAvg = quest.ratingavg || 0;
  return (
    <div className={`details ${subfield}`}>
      {subfield === 'ratingavg' && ratingCount >= 1 && <StarRating readOnly={true} value={+ratingAvg} quantity={ratingCount}/>}
      {subfield === 'created' && ('Published ' + Moment(quest.created).format('MMM YYYY'))}
    </div>
  );
}

function renderStoredQuests(props: Props): JSX.Element {
  // Use BUNDLED_QUESTS when user not logged in
  const quests = BUNDLED_QUESTS.map((quest: Quest, i: number) => {
    return (<QuestButtonContainer
        id={`quest-${i}`}
        key={i}
        quest={quest}
        onClick={() => props.onQuest(quest)}>
      {renderDetails(quest, props.params.order)}
    </QuestButtonContainer>);
  });

  return (<Card
    title="Quests"
    className="search_card"
    icon="logo_outline"
    onReturn={props.onReturn}>
    {quests}
    <TextDivider text="More Quests"/>
    <span>
      <p className="center">Sign in for access to over 100 free quests!</p>
    </span>
    <Button className="mediumbutton" onClick={() => props.toCard('SEARCH_DISCLAIMER')} id="signin">Sign In</Button>
  </Card>);
}

function renderLoading(props: Props): JSX.Element {
  return (<Card
    title="Loading"
    className="search_card"
    onReturn={props.onReturn}>
    <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
  </Card>);
}

function renderNoQuests(props: Props): JSX.Element {
  return (<Card
    title="Quests"
    className="search_card"
    icon="logo_outline"
    onReturn={props.onReturn}>
    <div className="searchDescription">
      <h2>No quests found</h2>
      <span>
        <p>Try broadening the search by using fewer filters.</p>
        <p>If you still see no results, file feedback from the top corner menu.</p>
      </span>
      <Button className="mediumbutton" onClick={() => props.toCard('SEARCH_SETTINGS')} id="filter">Modify Search</Button>
    </div>
  </Card>);
}

export function search(props: Props): JSX.Element {
  if (!props.user.loggedIn) {
    return renderStoredQuests(props);
  }

  if (props.searching) {
    return renderLoading(props);
  }

  if (props.results.length === 0) {
    return renderNoQuests(props);
  }

  const quests = props.results.map((quest: Quest, i: number) => {
    return (<QuestButtonContainer
      id={`quest-${i}`}
      key={i}
      quest={quest}
      onClick={() => props.onQuest(quest)}>
        {renderDetails(quest, props.params.order)}
    </QuestButtonContainer>);
  });

  return (
    <Card
      title="Quests"
      className="search_card"
      icon="logo_outline"
      onReturn={props.onReturn}
      header={<div className="searchHeader">
        <Button className="searchResultInfo" disabled={true}>{props.results.length} quests for {props.settings.numPlayers} <img className="inline_icon" src="images/adventurer_small.svg"/></Button>
        <Button className="filter_button" onClick={() => props.toCard('SEARCH_SETTINGS')} id="filter">Filter &amp; Sort ></Button>
      </div>}
    >
      {quests}
    </Card>
  );
}

export default search;
