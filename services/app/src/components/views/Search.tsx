import * as React from 'react';
import {Quest} from 'shared/schema/Quests';
import {BUNDLED_QUESTS} from '../../Constants';
import {CardName, SearchParams, SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import {SubfieldType} from '../base/QuestButton';
import QuestButtonContainer from '../base/QuestButtonContainer';
import TextDivider from '../base/TextDivider';

export interface StateProps {
  params: SearchParams;
  settings: SettingsType;
  user: UserState;
  results: Quest[];
  searching: boolean;
}

export interface DispatchProps {
  toCard: (name: CardName) => void;
  onQuest: (quest: Quest) => void;
}

export interface Props extends StateProps, DispatchProps {}

function renderStoredQuests(props: Props): JSX.Element {
  // Use BUNDLED_QUESTS when user not logged in
  const quests = BUNDLED_QUESTS.map((quest: Quest, i: number) => {
    return (<QuestButtonContainer
        id={`quest-${i}`}
        key={i}
        quest={quest}
        subfield={(props.params.order && props.params.order.substring(1) as SubfieldType) || undefined}
        onClick={() => props.onQuest(quest)}
      />);
  });

  return (<Card
    title="Quests"
    className="search_card"
    onReturn={null}>
    {quests}
    <TextDivider text="More Quests"/>
    <span>
      <p className="center">Sign in for access to over 100 free quests!</p>
    </span>
    <Button className="mediumbutton" onClick={() => props.toCard('SEARCH_DISCLAIMER')} id="signin">Sign In</Button>
  </Card>);
}

function renderLoading(): JSX.Element {
  return (<Card
    title="Loading"
    className="search_card"
    onReturn={null}>
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
    onReturn={null}>
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
    return renderLoading();
  }

  if (props.results.length === 0) {
    return renderNoQuests(props);
  }

  // TODO Private quests as a state fetched on user login, to be shown at the top.
  const privateQuests: JSX.Element[] = [];
  const quests = props.results.map((quest: Quest, i: number) => {
    return (<QuestButtonContainer
      id={`quest-${i}`}
      key={i}
      quest={quest}
      subfield={(props.params.order && props.params.order.substring(1) as SubfieldType) || undefined}
      onClick={() => props.onQuest(quest)}
    />);
  });

  let content: JSX.Element | JSX.Element[];
  if (privateQuests.length > 0) {
    content = (<span>
      <TextDivider text="Private Quests"/>
      {privateQuests}
      <TextDivider text="Quests"/>
      {quests}
    </span>);
  } else {
    content = quests;
  }

  return (
    <Card
      title="Quests"
      className="search_card"
      onReturn={null}
      header={<div className="searchHeader">
        <Button className="searchResultInfo" disabled={true}>{props.results.length} quests for {props.settings.numPlayers} <img className="inline_icon" src="images/adventurer_small.svg"/></Button>
        <Button className="filter_button" onClick={() => props.toCard('SEARCH_SETTINGS')} id="filter">Filter &amp; Sort ></Button>
      </div>}
    >
      {content}
    </Card>
  );
}

export default search;
