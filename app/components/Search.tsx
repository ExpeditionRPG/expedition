import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import Checkbox from './base/Checkbox'
import {SearchSettings, SearchPhase, SearchState, UserState} from '../reducers/StateTypes'
import TextField from 'material-ui/TextField'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import {QuestDetails} from '../reducers/QuestTypes'
import theme from '../theme'

export interface SearchStateProps extends SearchState {
  phase: SearchPhase;
  numPlayers: number;
  user: UserState;
  search: SearchSettings;
}

export interface SearchDispatchProps {
  onLoginRequest: () => void;
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
        <div>
          <TextField id="text" hintText="text search - author, title, ID" hintStyle={{color: '#555555'}} onChange={(e: any) => this.onChange('text', e.target.value)} value={this.state.text}/>
        </div>
        <div>
          for {this.props.numPlayers} adventurer(s)
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
            <MenuItem value="-published" primaryText="Newest"/>
            <MenuItem value="+title" primaryText="Title"/>
            <MenuItem value="-maxTimeMinutes" primaryText="Play Time (longest)"/>
            <MenuItem value="+minTimeMinutes" primaryText="Play Time (shortest)"/>
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

function formatPlayPeriod(minMinutes: number, maxMinutes: number): string {
  if (minMinutes > 60 && maxMinutes > 60) {
    return Math.round(minMinutes / 60) + '-' + Math.round(maxMinutes / 60) + " hours";
  } else {
    return minMinutes + '-' + maxMinutes + " minutes";
  }
}

function renderResults(props: SearchProps): JSX.Element {
  let items: JSX.Element[] = props.results.map(function(result: QuestDetails, index: number) {

    return (
      <Button key={index} onTouchTap={() => props.onQuest(result)}>
        <div className="searchResult">
          <div className="title">{result.title}</div>
          <div className="summary">
            by {result.author}
            <br/>
            {result.minplayers}-{result.maxplayers} players, {formatPlayPeriod(result.mintimeminutes, result.maxtimeminutes)}
          </div>
        </div>
      </Button>
    );
  });

  let hint: JSX.Element = (<span></span>);
  if (props.results.length === 0) {
    hint = <div>
      <div>No results found.</div>
      <div>Try broadening your search.</div>
    </div>;
  }

  return (
    <Card title={props.results.length + " Results"}>
      {hint}
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

function renderDisclaimer(props: SearchProps): JSX.Element {
  return (
    <Card title="Disclaimer">
      <p>
        Community quests are published by other adventurers like yourselves. We offer no guarantees
        of completeness, correctness of grammar, or sanity in any of the quests you are about to see.
      </p>
      <p>
        We use your Google email as your identity when rating quests and to show your
        own (unpublished) quests.
      </p>
      <p>
        You must log in to continue:
      </p>
      <Button onTouchTap={(e)=>props.onLoginRequest()}>Continue with Google</Button>
    </Card>
  );
}

const Search = (props: SearchProps): JSX.Element => {
  switch(props.phase) {
    case "DISCLAIMER":
      return renderDisclaimer(props);
    case "SETTINGS":
      return renderSettings(props);
    case "SEARCH":
      return renderResults(props);
    case "DETAILS":
      return renderDetails(props);
    default:
      throw new Error("Unknown search phase " + props.phase);
  }
}

export default Search;
