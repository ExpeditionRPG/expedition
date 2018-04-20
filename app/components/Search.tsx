import * as React from 'react'
import Truncate from 'react-truncate'
import FlatButton from 'material-ui/FlatButton'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'
import TextField from 'material-ui/TextField'

import Button from './base/Button'
import Card from './base/Card'
import Checkbox from './base/Checkbox'
import StarRating from './base/StarRating'

import {SearchSettings, SearchPhase, SearchState, SettingsType, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {GenreType, CONTENT_RATINGS, LANGUAGES, PLAYTIME_MINUTES_BUCKETS} from '../Constants'

const Moment = require('moment');

export interface SearchStateProps extends SearchState {
  isDirectLinked: boolean;
  phase: SearchPhase;
  search: SearchSettings;
  settings: SettingsType;
  user: UserState;
}

export interface SearchDispatchProps {
  onLoginRequest: (subscribe: boolean) => void;
  onFilter: () => void;
  onSearch: (search: SearchSettings, settings: SettingsType) => void;
  onQuest: (quest: QuestDetails) => void;
  onPlay: (quest: QuestDetails, isDirectLinked: boolean) => void;
  onReturn: () => void;
}

export interface SearchProps extends SearchStateProps, SearchDispatchProps {};

// We make this a react component to hold a bit of state and avoid sending
// redux actions for every single change to input.
export interface SearchSettingsCardProps {
  user: UserState;
  search: SearchSettings;
  settings: SettingsType;
  onSearch: (search: SearchSettings, settings: SettingsType) => void;
}


export class SearchSettingsCard extends React.Component<SearchSettingsCardProps, {}> {
  state: SearchSettings;

  constructor(props: SearchSettingsCardProps) {
    super(props)
    this.state = this.props.search;
  }

  onChange(attrib: string, value: string) {
    this.setState({[attrib]: value});
  }

// TODO once Material UI adds support for theming SelectFields (https://github.com/callemall/material-ui/issues/7044)
// (aka Material UI 1.0) then remove the clutter here / move to Theme.tsx
  render() {
    const rating = (this.state.contentrating) ? CONTENT_RATINGS[this.state.contentrating] : undefined;
    const timeBuckets = PLAYTIME_MINUTES_BUCKETS.map((minutes: number, index: number) => {
      return <MenuItem key={index} value={minutes} primaryText={`${minutes} min`}/>;
    });
    // TODO Once we have 3 romance quests, change code to just display genre list
    const visibleGenres: GenreType[] = ['Comedy', 'Drama', 'Horror', 'Mystery'];
    return (
      <Card title="Quest Search">
        <div className="searchForm">
          <div className="searchDescription">
            For {this.props.settings.numPlayers} adventurer{this.props.settings.numPlayers > 1 ? 's' : ''} with {this.props.settings.contentSets.horror ? 'The Horror' : 'the base game'} (based on settings)
          </div>
          <TextField
            id="text"
            className="textfield"
            fullWidth={true}
            hintText="text search - title, author, ID"
            onChange={(e: any, v: string) => this.onChange('text', v)}
            underlineShow={false}
            value={this.state.text}
          />
          <SelectField
            id="order"
            className="selectfield"
            floatingLabelText="Sort by"
            onChange={(e: any, i: number, v: string) => this.onChange('order', v)}
            value={this.state.order}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value="-created" primaryText="Newest"/>
            <MenuItem value="+ratingavg" primaryText="Highest rated"/>
            <MenuItem value="+title" primaryText="Title (A-Z)"/>
            <MenuItem value="-title" primaryText="Title (Z-A)"/>
          </SelectField>
          <SelectField
            id="mintimeminutes"
            className="selectfield halfLeft"
            floatingLabelText="Minimum time"
            floatingLabelFixed={true}
            onChange={(e: any, i: number, v: string) => this.onChange('mintimeminutes', v)}
            value={this.state.mintimeminutes}
            underlineStyle={{borderColor: 'black'}}
            selectedMenuItemStyle={{paddingRight: '50px'}}
          >
            <MenuItem value={undefined} primaryText="Any length"/>
            {timeBuckets}
          </SelectField>
          <SelectField
            id="maxtimeminutes"
            className="selectfield halfRight"
            floatingLabelText="Maximum time"
            floatingLabelFixed={true}
            onChange={(e: any, i: number, v: string) => this.onChange('maxtimeminutes', v)}
            value={this.state.maxtimeminutes}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={undefined} primaryText="Any length"/>
            {timeBuckets}
          </SelectField>
          <SelectField
            id="age"
            className="selectfield"
            floatingLabelText="Recency"
            onChange={(e: any, i: number, v: string) => this.onChange('age', v)}
            value={this.state.age}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={undefined} primaryText="All time"/>
            <MenuItem value={31536000} primaryText="Published this year"/>
            <MenuItem value={2592000} primaryText="Published this month"/>
            <MenuItem value={604800} primaryText="Published this week"/>
          </SelectField>
          <SelectField
            id="language"
            className="selectfield"
            floatingLabelText="Language"
            onChange={(e: any, i: number, v: string) => this.onChange('language', v)}
            value={this.state.language}
            underlineStyle={{borderColor: 'black'}}
          >
            {LANGUAGES.map((language:string, i: number) => { return <MenuItem key={i} value={language} primaryText={language}></MenuItem>})}
          </SelectField>
          <SelectField
            id="genre"
            className="selectfield"
            floatingLabelText="Genre"
            onChange={(e: any, i: number, v: string) => this.onChange('genre', v)}
            value={this.state.genre}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={undefined} primaryText="All genres"/>
            {visibleGenres.map((genre:string, i: number) => { return <MenuItem key={i} value={genre} primaryText={genre}></MenuItem>})}
          </SelectField>
          <SelectField
            id="contentrating"
            className="selectfield"
            floatingLabelText="Content Rating"
            onChange={(e: any, i: number, v: string) => this.onChange('contentrating', v)}
            value={this.state.contentrating}
            underlineStyle={{borderColor: 'black'}}
          >
            <MenuItem value={undefined} primaryText="All ratings"/>
            <MenuItem value="Kid-friendly" primaryText="Kid-friendly"/>
            <MenuItem value="Teen" primaryText="Teen"/>
            <MenuItem value="Adult" primaryText="Adult"/>
          </SelectField>
          {rating && <div className="ratingDescription">
            <span>"{this.state.contentrating}" rating means: {rating.summary}</span>
          </div>}
          <Button onTouchTap={() => this.props.onSearch(this.state, this.props.settings)} remoteID="search" id="search">Search</Button>
        </div>
      </Card>
    );
  }
}

function renderSettings(props: SearchProps): JSX.Element {
  return (<SearchSettingsCard search={props.search} settings={props.settings} onSearch={props.onSearch} user={props.user} />);
}

export function formatPlayPeriod(minMinutes: number, maxMinutes: number): string {
  if (maxMinutes >= 999) {
    if (minMinutes >= 999) {
      return '2+ hrs';
    } else if (minMinutes >= 60) {
      return Math.round(minMinutes / 60) + '+ hrs';
    } else {
      return Math.round(minMinutes) + '+ min';
    }
  } else if (minMinutes >= 60 && maxMinutes >= 60) {
    return Math.round(minMinutes / 60) + '-' + Math.round(maxMinutes / 60) + ' hrs';
  } else {
    return minMinutes + '-' + maxMinutes + ' min';
  }
}

export interface SearchResultProps {
  index: number;
  quest: QuestDetails;
  search: SearchSettings;
  onQuest: (quest: QuestDetails) => void;
}

export function renderResult(props: SearchResultProps): JSX.Element {
  const orderField = props.search.order && props.search.order.substring(1);
  const quest = props.quest;
  let orderDetails = <span></span>;
  if (orderField) {
    const ratingCount = quest.ratingcount || 0;
    const ratingAvg = quest.ratingavg || 0;
    orderDetails = (
      <div className={`searchOrderDetail ${orderField}`}>
        {orderField === 'ratingavg' && ratingCount >= 1 && <StarRating readOnly={true} value={+ratingAvg} quantity={ratingCount}/>}
        {orderField === 'created' && `Published ${Moment(quest.created).format('MMM YYYY')}`}
      </div>
    );
  }

  return (
    <Button key={props.index} onTouchTap={() => props.onQuest(quest)} remoteID={'quest-'+props.index}>
      <div className="searchResult">
        <div className="title">{quest.title}</div>
        <div className="summary">
          <Truncate lines={3}>
            {quest.summary || ''}
          </Truncate>
        </div>
        {quest.mintimeminutes !== undefined && quest.maxtimeminutes !== undefined &&
          <div className="timing">
            {formatPlayPeriod(quest.mintimeminutes, quest.maxtimeminutes)}
          </div>
        }
        {orderDetails}
        <span className="expansions">
          {quest.expansionhorror && <img className="inline_icon" src="images/horror_small.svg"></img>}
        </span>
      </div>
    </Button>
  );
}

function renderResults(props: SearchProps, hideHeader?: boolean): JSX.Element {
  const results: JSX.Element[] = (props.results || []).map((quest: QuestDetails, index: number) => {
    return renderResult({index, quest, search: props.search, onQuest: props.onQuest});
  });

  return (
    <Card
      title="Quest Search Results"
      header={(hideHeader) ? undefined : <div className="searchHeader">
        <span>{props.results.length} quests for {props.settings.numPlayers} <img className="inline_icon" src="images/adventurer_small.svg"/></span>
        <Button className="filter_button" onTouchTap={() => props.onFilter()} remoteID="filter">Filter &amp; Sort ></Button>
      </div>}
    >
      {results.length === 0 && !props.searching &&
        <div>
          <div>No results found.</div>
          {!hideHeader && <div>Try broadening your search.</div>}
        </div>
      }
      {results.length === 0 && props.searching && <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>}
      {results}
    </Card>
  );
}

function renderDetails(props: SearchProps): JSX.Element {
  const quest = props.selected;
  if (!quest) {
    return <Card title="Quest Details">Loading...</Card>
  }
  const expansions = (quest.expansionhorror) ? <span><img className="inline_icon" src="images/horror_small.svg"/>The Horror</span> : 'None';
  const ratingAvg = quest.ratingavg || 0;
  return (
    <Card title="Quest Details">
      <div className="searchDetails">
        <h2>{quest.title}</h2>
        <div>{quest.summary}</div>
        <div className="author">by {quest.author}</div>
        {(quest.ratingcount && quest.ratingcount >= 1) ? <StarRating readOnly={true} value={+ratingAvg} quantity={quest.ratingcount}/> : ''}
      </div>
      <Button className="bigbutton" onTouchTap={(e)=>props.onPlay(quest, props.isDirectLinked)} remoteID="play">Play</Button>
      <Button onTouchTap={(e)=>props.onReturn()} remoteID="back">Pick a different quest</Button>
      <div className="searchDetailsExtended">
        <h3>Details</h3>
        <div><strong>Expansions required: </strong>{expansions}</div>
        <div><strong>Content rating:</strong> {quest.contentrating}</div>
        {quest.mintimeminutes !== undefined && quest.maxtimeminutes !== undefined &&
          <div className="timing">
            <strong>Play time:</strong> {formatPlayPeriod(quest.mintimeminutes, quest.maxtimeminutes)}
          </div>
        }
        <div><strong>Players:</strong> {quest.minplayers}-{quest.maxplayers}</div>
        <div><strong>Genre:</strong> {quest.genre}</div>
        <div><strong>Language:</strong> {quest.language}</div>
        <div><strong>Last updated: </strong> {Moment(quest.published).format('MMMM D, YYYY')}</div>
      </div>
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
          Community quests are written by adventurers like yourselves using the free quest creator (Quests.ExpeditionGame.com).
          We offer no guarantees for the quests you are about to play, but do our best to review them for quality, and provide players with
          the ability to rate, review and report quests.
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
    case 'PRIVATE':
      return renderResults(props, true);
    case 'DETAILS':
      return renderDetails(props);
    default:
      throw new Error('Unknown search phase ' + props.phase);
  }
}

export default Search;
