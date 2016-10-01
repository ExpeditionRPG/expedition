import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import Checkbox from './base/Checkbox'
import {SearchSettings, SearchPhase, SearchState, UserState} from '../reducers/StateTypes'
import TextField from 'material-ui/TextField'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import {QuestDetails} from '../reducers/QuestTypes.tsx'

export interface SearchStateProps extends SearchState {
  numPlayers: number;
  user: UserState;
  search: SearchSettings;
}

export interface SearchDispatchProps {
  onLoginRequest: () => void;
  onSearch: (numPlayers: number, user: UserState, request: SearchSettings) => void;
  onQuest: (quest: QuestDetails) => void;
  onPlay: (quest: QuestDetails) => void;
  onReturn: () => void;
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
  onReturn: () => void;
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
      <Card title="Public Quests" icon="adventurer" onReturn={this.props.onReturn}>
        <div>
          Quests where author, title, or ID contains
          <TextField id="text" hintText="some text" hintStyle={{color: '#555555'}} onChange={(e: any) => this.onChange('text', e.target.value)} value={this.state.text}/>
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
            <MenuItem value="+meta_title" primaryText="Title"/>
            <MenuItem value="-meta_maxTimeMinutes" primaryText="Play Time (longest)"/>
            <MenuItem value="+meta_minTimeMinutes" primaryText="Play Time (shortest)"/>
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
  return (<SearchSettingsCard search={props.search} onReturn={props.onReturn} onSearch={props.onSearch} user={props.user} numPlayers={props.numPlayers}/>);
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

    let abnormalShare: JSX.Element = (<span></span>);
    if (!result.published && !result.shared) {
      return (<div><strong>PRIVATE</strong></div>);
    }
    if (!result.published && result.shared) {
      return (<div><strong>UNLISTED</strong></div>);
    }

    return (
      <Button key={index} onTouchTap={() => props.onQuest(result)}>
        <h1>{result.meta_title}</h1>
        <div>by {result.meta_author}</div>
        <div>{result.meta_minPlayers}-{result.meta_maxPlayers} players, {formatPlayPeriod(result.meta_minTimeMinutes, result.meta_maxTimeMinutes)}</div>
        {abnormalShare}
      </Button>
    );
  });

  let hint = (props.results.length > 0) ? ("Found " + props.results.length + " results.") : "No results found. Please broaden your search.";

  return (
    <Card title="Search Results" onReturn={props.onReturn}>
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
    <Card title="Quest Details" onReturn={props.onReturn}>
      <div style={{textAlign: 'center'}}>
        <h3>{props.selected.meta_title}</h3>
        <div style={{fontStyle: 'italic'}}>by {props.selected.meta_author}</div>
        <p>
          {props.selected.meta_summary}
        </p>
      </div>
      {details}
      <Button onTouchTap={(e)=>props.onPlay(props.selected)}>Play</Button>
    </Card>
  );
}

function renderDisclaimer(props: SearchProps): JSX.Element {
  return (
    <Card title="Disclaimer" onReturn={props.onReturn}>
      <p>
        Community quests are published by other adventurers like yourselves. We offer no guarantees
        of completeness, correctness of grammar, or sanity in any of the quests you are about to see.
      </p>
      <p>
        We use your basic Google account information as your identity when rating quests and to show your
        own (unpublished) quests. You must log in to continue.
      </p>
      <Button onTouchTap={(e)=>props.onLoginRequest()}>Continue with Google</Button>
    </Card>
  );
}

/*
:host ::content instruction {
  display: block;
  padding: var(--vw-small);
};
:host ::content comment {
  display: none;
};

#fileselect {
  position: fixed;
  top: -100em;
}

#questchooser a {
  display: inline-block;
  float: right;
}

#quest {
  display: inline-block;
  font-size: var(--font-size-interactive);
  padding: var(--vh-base) 0;
  font-family: var(--font-body);
  border: var(--border-size) solid var(--border-color-accent);
  line-height: 1.2em;
  margin-top: var(--vh-base);
}

.pad {
  padding-left: var(--vw-base);
  @apply(--layout-flex-3);
  @apply(--layout-vertical);
}

.centered {
  text-align: center;
}
.centered h3 {
  margin: 0;
}
.centered .author {
  font-size: var(--font-size-flavortext);
  margin-bottom: var(--vw-large);
}

paper-dropdown-menu, paper-input {
  --paper-input-container-input: {
    font-family: inherit;
    font-size: inherit;
  }
  --paper-input-container-label: {
    font-family: var(--font-header);
  }
}
*/

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