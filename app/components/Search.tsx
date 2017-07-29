import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'

import Button from './base/Button'
import Card from './base/Card'
import Checkbox from './base/Checkbox'
import StarRating from './base/StarRating'

import {SearchSettings, SearchPhase, SearchState, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {GenreType, CONTENT_RATINGS, PLAYTIME_MINUTES_BUCKETS, SUMMARY_MAX_LENGTH} from '../Constants'

const Moment = require('moment');

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

// TODO once Material UI adds support for theming SelectFields (https://github.com/callemall/material-ui/issues/7044)
// then remove the clutter here / move to Theme.tsx
  render() {
    const rating = CONTENT_RATINGS[this.state.contentrating];
    const timeBuckets = PLAYTIME_MINUTES_BUCKETS.map((minutes: number, index: number) => {
      return <MenuItem key={index} value={minutes} primaryText={`${minutes} min`}/>;
    });
    // TODO Until we have at least 3 quests in all genres, only show limited options
    const visibleGenres: GenreType[] = ['Comedy', 'Drama'];
    return (
      <Card title="Quest Search">
        <div className="searchForm">
          <FlatButton disabled={true}>
            For {this.props.numPlayers} adventurer{this.props.numPlayers > 1 ? 's' : ''} (changeable in settings)
          </FlatButton>
          <TextField
            className="textfield"
            fullWidth={true}
            hintText="text search - title, author, ID"
            onChange={(e: any) => this.onChange('text', e.target.value)}
            underlineShow={false}
            value={this.state.text}
          />
          <SelectField
            className="selectfield"
            floatingLabelText="Sort by"
            onChange={(e: any, i: any, v: string) => this.onChange('order', v)}
            value={this.state.order}
            style={{color: 'black'}}
            floatingLabelStyle={{color: 'black'}}
            iconStyle={{fill: 'black'}}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value="-created" primaryText="Newest"/>
            <MenuItem value="+ratingavg" primaryText="Highest rated"/>
            <MenuItem value="+title" primaryText="Title (A-Z)"/>
            <MenuItem value="-title" primaryText="Title (Z-A)"/>
          </SelectField>
          <SelectField
            className="selectfield halfLeft"
            floatingLabelText="Minimum time"
            floatingLabelFixed={true}
            onChange={(e: any, i: any, v: string) => this.onChange('mintimeminutes', v)}
            value={this.state.mintimeminutes}
            style={{color: 'black'}}
            floatingLabelStyle={{color: 'black'}}
            iconStyle={{fill: 'black'}}
            underlineStyle={{borderColor: 'black'}}
            selectedMenuItemStyle={{paddingRight: '50px'}}
          >
            <MenuItem value={null} primaryText="Any length"/>
            {timeBuckets}
          </SelectField>
          <SelectField
            className="selectfield halfRight"
            floatingLabelText="Maximum time"
            floatingLabelFixed={true}
            onChange={(e: any, i: any, v: string) => this.onChange('maxtimeminutes', v)}
            value={this.state.maxtimeminutes}
            style={{color: 'black'}}
            floatingLabelStyle={{color: 'black'}}
            iconStyle={{fill: 'black'}}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={null} primaryText="Any length"/>
            {timeBuckets}
          </SelectField>
          <SelectField
            className="selectfield"
            floatingLabelText="Recency"
            onChange={(e: any, i: any, v: string) => this.onChange('age', v)}
            value={this.state.age}
            style={{color: 'black'}}
            floatingLabelStyle={{color: 'black'}}
            iconStyle={{fill: 'black'}}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={null} primaryText="All time"/>
            <MenuItem value={31536000} primaryText="Published this year"/>
            <MenuItem value={2592000} primaryText="Published this month"/>
            <MenuItem value={604800} primaryText="Published this week"/>
            <MenuItem value={86400} primaryText="Published today"/>
          </SelectField>
          <SelectField
            className="selectfield"
            floatingLabelText="Genre"
            onChange={(e: any, i: any, v: string) => this.onChange('genre', v)}
            value={this.state.genre}
            style={{color: 'black'}}
            floatingLabelStyle={{color: 'black'}}
            iconStyle={{fill: 'black'}}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={null} primaryText="All genres"/>
            {visibleGenres.map((genre:string, i: number) => { return <MenuItem key={i} value={genre} primaryText={genre}></MenuItem>})}
          </SelectField>
          <SelectField
            className="selectfield"
            floatingLabelText="Content Rating"
            onChange={(e: any, i: any, v: string) => this.onChange('contentrating', v)}
            value={this.state.contentrating}
            style={{color: 'black'}}
            floatingLabelStyle={{color: 'black'}}
            iconStyle={{fill: 'black'}}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={null} primaryText="All ratings"/>
            <MenuItem value="Kid-friendly" primaryText="Kid-friendly"/>
            <MenuItem value="Teen" primaryText="Teen"/>
            <MenuItem value="Adult" primaryText="Adult"/>
          </SelectField>
          {rating && <div className="ratingDescription">
            <span>"{this.state.contentrating}" rating means: {rating.summary}</span>
          </div>}
          <Button onTouchTap={() => this.props.onSearch(this.props.numPlayers, this.props.user, this.state)}>Search</Button>
        </div>
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
  const orderField = props.search.order.substring(1);
  const items: JSX.Element[] = props.results.map((result: QuestDetails, index: number) => {
    return (
      <Button key={index} onTouchTap={() => props.onQuest(result)}>
        <div className="searchResult">
          <div className="title">{result.title}</div>
          <div className="summary">
            <div>{truncateSummary(result.summary)}</div>
          </div>
          <div className="timing">
            {formatPlayPeriod(result.mintimeminutes, result.maxtimeminutes)}
          </div>
          <div className={`searchOrderDetail ${orderField}`}>
            {orderField === 'ratingavg' && result.ratingcount >= 5 && <StarRating readOnly={true} value={+result.ratingavg} quantity={result.ratingcount}/>}
            {orderField === 'created' && `Published ${Moment(result.created).format('MMM YYYY')}`}
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
  const details: JSX.Element = <span></span>;
  const quest = props.selected;
  return (
    <Card title="Quest Details">
      <div className="searchDetails">
        <h3>{quest.title}</h3>
        <div className="author">by {quest.author}</div>
        <p>
          {quest.summary}
        </p>
        {quest.ratingcount && quest.ratingcount >= 5 && <StarRating readOnly={true} value={+quest.ratingavg} quantity={quest.ratingcount}/>}
      </div>
      {details}
      <Button onTouchTap={(e)=>props.onPlay(quest)}>Play</Button>
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
