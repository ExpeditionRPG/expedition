import * as React from 'react'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import TextField from 'material-ui/TextField'

import Card from './base/Card'
import Button from './base/Button'
import Checkbox from './base/Checkbox'

import {SearchSettings, SearchPhase, SearchState, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

import {SUMMARY_MAX_LENGTH} from '../Constants'

export interface SearchStateProps extends SearchState {
  numPlayers: number;
  phase: SearchPhase;
  search: SearchSettings;
  user: UserState;
}

export interface SearchDispatchProps {
  onLoginRequest: (subscribe: boolean) => void;
  onFilter: () => void;
  onSearch: (numPlayers: number, user: UserState, request: SearchSettings) => void;
  onQuest: (quest: QuestDetails) => void;
  onPlay: (quest: QuestDetails) => void;
  onOwnedChange: (checked: boolean) => void;
}

export interface SearchProps extends SearchStateProps, SearchDispatchProps {};

// We make this a react component to hold a bit of state and avoid sending
// redux actions for every single change to input.
interface SearchSettingsCardProps {
  numPlayers: number;
  user: UserState;
  search: SearchSettings;
  onSearch: (numPlayers: number, user: UserState, request: SearchSettings) => void;
}


class SearchSettingsCard extends React.Component<SearchSettingsCardProps, {}> {
  state: SearchSettings;

  constructor(props: SearchSettingsCardProps) {
    super(props)
    this.state = this.props.search;
  }

  onChange(attrib: string, value: string) {
    this.setState({[attrib]: value});
  }

  render() {
    return (
      <Card title="Public Quests" icon="adventurer">
        <TextField
          className="textfield"
          fullWidth={true}
          hintText="text search - title, author, ID"
          onChange={(e: any) => this.onChange('text', e.target.value)}
          underlineShow={false}
          value={this.state.text}
        />
        <div>
          for {this.props.numPlayers} adventurer{this.props.numPlayers > 1 ? 's' : ''} (changeable in settings)
        </div>
        <div>
          published within
          <DropDownMenu onChange={(e: any, i: any, v: string) => this.onChange('age', v)} value={this.state.age}>
            <MenuItem value="inf" primaryText="all time"/>
            <MenuItem value="31536000" primaryText="the past year"/>
            <MenuItem value="2592000" primaryText="the past month"/>
            <MenuItem value="604800" primaryText="the past week"/>
            <MenuItem value="86400" primaryText="the past 24 hours"/>
            <MenuItem value="3600" primaryText="the past hour"/>
          </DropDownMenu>
        </div>
        <div>
          ordered by
          <DropDownMenu onChange={(e: any, i: any, v: string) => this.onChange('order', v)} value={this.state.order}>
            <MenuItem value="-created" primaryText="Newest"/>
            <MenuItem value="+title" primaryText="Title"/>
            <MenuItem value="-minTimeMinutes" primaryText="Play Time (longest)"/>
            <MenuItem value="+maxTimeMinutes" primaryText="Play Time (shortest)"/>
          </DropDownMenu>
        </div>
        <div>
          created by
          <DropDownMenu onChange={(e: any, i: any, v: string) => this.onChange('owner', v)} value={this.state.owner}>
            <MenuItem value="self" primaryText="You"/>
            <MenuItem value="anyone" primaryText="Anyone"/>
          </DropDownMenu>
        </div>
        <Button onTouchTap={() => this.props.onSearch(this.props.numPlayers, this.props.user, this.state)}>Search</Button>
      </Card>
    );
  }
}

function renderSettings(props: SearchProps): JSX.Element {
  return (<SearchSettingsCard search={props.search} onSearch={props.onSearch} user={props.user} numPlayers={props.numPlayers}/>);
}

export function formatPlayPeriod(minMinutes: number, maxMinutes: number): string {
  if (minMinutes >= 60 && maxMinutes >= 60) {
    return Math.round(minMinutes / 60) + '-' + Math.round(maxMinutes / 60) + ' hrs';
  } else {
    return minMinutes + '-' + maxMinutes + ' min';
  }
}

export function truncateSummary(string: string) {
  if (string.length < SUMMARY_MAX_LENGTH) {
    return string;
  } else {
    return string.substring(0, SUMMARY_MAX_LENGTH - 3) + '...';
  }
}

function renderResults(props: SearchProps): JSX.Element {
  let items: JSX.Element[] = props.results.map(function(result: QuestDetails, index: number) {
    return (
      <Button key={index} onTouchTap={() => props.onQuest(result)}>
        <div className="searchResult">
          <div className="title">{result.title}</div>
          <div className="timing">
            <img className="inline_icon" src="images/clock_small.svg"/>{formatPlayPeriod(result.mintimeminutes, result.maxtimeminutes)}
          </div>
          <div className="summary">
            <div>{truncateSummary(result.summary)}</div>
          </div>
        </div>
      </Button>
    );
  });

  return (
    <Card
      title="Quest Search Results"
      header={<div className="searchHeader">
        <span>{props.results.length} quests for {props.numPlayers} <img className="inline_icon" src="images/adventurer_small.svg"/></span>
        <Button className="float_right filter_button" onTouchTap={() => props.onFilter()}>Filter ></Button>
      </div>}
    >
      {items.length === 0 &&
        <div>
          <div>No results found.</div>
          <div>Try broadening your search.</div>
        </div>
      }
      {items}
    </Card>
  );
}

function renderDetails(props: SearchProps): JSX.Element {
  let details: JSX.Element = <span></span>

  /*
  details =
    <Indicator icon="helper">
      <div>URL: <a href="{props.selected.url}" target="_blank">{props.selected.shorturl}</a></div>
      <div>Email: {props.selected.email}</div>
      <div>Players: {props.selected.num_players}</div>
      <div>Play time: {props.selected.play_period}</div>
      <div>Last update: {props.selected.modified}</div>
      <template is="dom-if" if="{{quest.user_owned}}">
        <div>{props.selected.created}</div>
        <div>{props.selected.published}</div>
      </template>
    </Indicator>
  */
  return (
    <Card title="Quest Details">
      <div className="searchDetails">
        <h3>{props.selected.title}</h3>
        <div className="author">by {props.selected.author}</div>
        <p>
          {props.selected.summary}
        </p>
      </div>
      {details}
      <Button onTouchTap={(e)=>props.onPlay(props.selected)}>Play</Button>
    </Card>
  );
}

// We make this a react component to hold a bit of state and avoid sending
// redux actions for every single change to input.
interface SearchDisclaimerCardProps {
  onLoginRequest: (subscribe: boolean) => void;
}

class SearchDisclaimerCard extends React.Component<SearchDisclaimerCardProps, {}> {
  state: {
    subscribe: boolean;
  };

  constructor(props: SearchDisclaimerCardProps) {
    super(props)
    this.state = {
      subscribe: false,
    };
  }

  onSubscribeChange(value: boolean) {
    this.setState({subscribe: value});
  }

  render() {
    return (
      <Card title="Disclaimer">
        <p>
          Community quests are published by other adventurers like yourselves using the free quest creator (Quests.ExpeditionGame.com).
          We offer no guarantees of completeness, correctness of grammar, or sanity in any of the quests you are about to see.
        </p>
        <p>
          We use your Google email as your identity when rating and reviewing quests.
        </p>
        <p>
          You must log in to continue:
        </p>
        <Checkbox label="Join the Mailing List" value={this.state.subscribe} onChange={(v: boolean) => { this.onSubscribeChange(v); }}>
          Learn about the latest quests, features and more - once per month!
        </Checkbox>
        <Button onTouchTap={(e)=>this.props.onLoginRequest(this.state.subscribe)}>Continue with Google</Button>
      </Card>
    );
  }
}

function renderDisclaimer(props: SearchProps): JSX.Element {
  return (<SearchDisclaimerCard onLoginRequest={props.onLoginRequest}/>);
}

const Search = (props: SearchProps): JSX.Element => {
  switch(props.phase) {
    case 'DISCLAIMER':
      return renderDisclaimer(props);
    case 'SETTINGS':
      return renderSettings(props);
    case 'SEARCH':
      return renderResults(props);
    case 'DETAILS':
      return renderDetails(props);
    default:
      throw new Error('Unknown search phase ' + props.phase);
  }
}

export default Search;
