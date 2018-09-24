import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';
import DoneIcon from '@material-ui/icons/Done';
import OfflinePin from '@material-ui/icons/OfflinePin';
import StarsIcon from '@material-ui/icons/Stars';
import * as React from 'react';
import Truncate from 'react-truncate';
import {CONTENT_RATING_DESC, GenreType, LANGUAGES} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {PLAYTIME_MINUTES_BUCKETS} from '../../Constants';
import {formatPlayPeriod, smartTruncateSummary} from '../../Format';
import {SearchPhase, SearchSettings, SearchState, SettingsType, UserQuestHistory, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import Checkbox from '../base/Checkbox';
import StarRating from '../base/StarRating';

const Moment = require('moment');

export interface StateProps extends SearchState {
  isDirectLinked: boolean;
  phase: SearchPhase;
  search: SearchSettings;
  settings: SettingsType;
  user: UserState;
  questHistory: UserQuestHistory;
  offlineQuests: {[id: string]: boolean};
}

export interface DispatchProps {
  onFilter: () => void;
  onLoginRequest: (subscribe: boolean) => void;
  onQuest: (quest: Quest) => void;
  onReturn: () => void;
  onSearch: (search: SearchSettings, settings: SettingsType) => void;
}

export interface Props extends StateProps, DispatchProps {}

// We make this a react component to hold a bit of state and avoid sending
// redux actions for every single change to input.
export interface SearchSettingsCardProps {
  onSearch: (search: SearchSettings, settings: SettingsType) => void;
  search: SearchSettings;
  settings: SettingsType;
  user: UserState;
}

export class SearchSettingsCard extends React.Component<SearchSettingsCardProps, {}> {
  public state: SearchSettings;

  constructor(props: SearchSettingsCardProps) {
    super(props);
    this.state = this.props.search;
  }

  public onChange(attrib: string, value: any) {
    this.setState({[attrib]: value});
  }

  public submit(e: React.FormEvent | React.MouseEvent | undefined) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSearch(this.state, this.props.settings);
  }

// TODO remove the clutter here / move to Theme.tsx
  public render() {
    const rating = (this.state.contentrating) ? CONTENT_RATING_DESC[this.state.contentrating] : undefined;
    const timeBuckets = PLAYTIME_MINUTES_BUCKETS.map((minutes: number, index: number) => {
      return <option key={index} value={minutes}>{`${minutes} min`}</option>;
    });
    // TODO Once we have 3 romance quests, change code to just display genre list
    const visibleGenres: GenreType[] = ['Comedy', 'Drama', 'Horror', 'Mystery'];
    return (
      <Card title="Quest Search">
        <form className="searchForm" autoComplete="off" onSubmit={(e: React.FormEvent) => {this.submit(e); }}>
          <div className="searchDescription">
            For {this.props.settings.numPlayers} adventurer{this.props.settings.numPlayers > 1 ? 's' : ''} with {this.props.settings.contentSets.horror ? 'The Horror' : 'the base game'} (based on settings)
          </div>
          <FormControl fullWidth={true}>
            <TextField
              id="text"
              className="textfield"
              fullWidth={true}
              label="text search - title, author, ID"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onChange('text', e.target.value)}
              onFocus={(e: any) => e.target.scrollIntoView()}
              value={this.state.text}
            />
          </FormControl>
          <FormControl className="selectfield" fullWidth={true}>
            <InputLabel htmlFor="order">Sort by</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'order',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('order', e.target.value)}
              value={this.state.order}
            >
              <option value="+ratingavg">Highest rated</option>
              <option value="-created">Newest</option>
              <option value="+title">Title (A-Z)</option>
              <option value="-title">Title (Z-A)</option>
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft ranged">
            <InputLabel htmlFor="mintimeminutes">Minimum time</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'mintimeminutes',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('mintimeminutes', e.target.value)}
              value={this.state.mintimeminutes}
            >
              <option value={undefined}>Any length</option>
              {timeBuckets}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfRight">
            <InputLabel htmlFor="maxtimeminutes">Maximum time</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'maxtimeminutes',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('maxtimeminutes', e.target.value)}
              value={this.state.maxtimeminutes}
            >
              <option value={undefined}>Any length</option>
              {timeBuckets}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft">
            <InputLabel htmlFor="age">Recency</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'age',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('age', e.target.value)}
              value={this.state.age}
            >
              <option value={undefined}>All time</option>
              <option value={31536000}>Published this year</option>
              <option value={2592000}>Published this month</option>
              <option value={604800}>Published this week</option>
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfRight">
            <InputLabel htmlFor="language">Language</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'language',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('language', e.target.value)}
              value={this.state.language}
            >
              {LANGUAGES.map((language: string, i: number) => <option key={i} value={language}>{language}</option>)}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft">
            <InputLabel htmlFor="genre">Genre</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'genre',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('genre', e.target.value)}
              value={this.state.genre}
            >
              <option value={undefined}>All genres</option>
              {visibleGenres.map((genre: string, i: number) => <option key={i} value={genre}>{genre}</option>)}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfRight">
            <InputLabel htmlFor="contentrating">Content Rating</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'contentrating',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('contentrating', e.target.value)}
              value={this.state.contentrating}
            >
              <option value={undefined}>All ratings</option>
              <option value="Kid-friendly">Kid-friendly</option>
              <option value="Teen">Teen</option>
              <option value="Adult">Adult</option>
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft">
            <InputLabel htmlFor="requirespenpaper">Requires Pen & Paper</InputLabel>
            <NativeSelect
              inputProps={{
                id: 'requirespenpaper',
              }}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('requirespenpaper', e.target.value)}
              value={this.state.requirespenpaper}
            >
              <option value={undefined}>No Preference</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </FormControl>
          {rating && <div className="ratingDescription">
            <span>"{this.state.contentrating}" rating means: {rating.summary}</span>
          </div>}
          <Button onClick={(e: React.FormEvent) => {this.submit(e); }} id="search">Search</Button>
        </form>
      </Card>
    );
  }
}

function renderSettings(props: Props): JSX.Element {
  return (<SearchSettingsCard search={props.search} settings={props.settings} onSearch={props.onSearch} user={props.user} />);
}

export interface SearchResultProps {
  index: number;
  lastLogin: Date;
  lastPlayed: Date | null;
  onQuest: (quest: Quest) => void;
  quest: Quest;
  search: SearchSettings;
  offlineQuests: {[id: string]: boolean};
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
        {orderField === 'created' && ('Published ' + Moment(quest.created).format('MMM YYYY'))}
      </div>
    );
  }
  const classes = ['searchResult'];
  if (props.lastPlayed) {
    classes.push('played');
  }

  return (
    <Button key={props.index} onClick={() => props.onQuest(quest)} id={'quest-' + props.index}>
      <div className={classes.join(' ')}>
        <table className="searchResultsTitleTable">
          <tbody>
            <tr>
              <th className="leftcell">
                <Truncate lines={2}>
                  {quest.title}
                </Truncate>
              </th>
              <th className="rightcell">
                {(props.lastLogin < quest.created || Moment().diff(quest.created, 'days') <= 7) && !props.lastPlayed &&
                  <div className="badge">NEW</div>}
                {props.lastPlayed && <DoneIcon className="inline_icon questPlayedIcon" />}
                {quest.official && <span className="indicator_spacer"><img className="inline_icon questOfficialIcon" src="images/compass_small.svg"/></span>}
                {quest.awarded && <StarsIcon className="inline_icon questAwardedIcon" />}
              </th>
            </tr>
          </tbody>
        </table>
        <div className="summary">
          <Truncate lines={3}>
            {smartTruncateSummary(quest.summary || '')}
          </Truncate>
        </div>
        {quest.mintimeminutes !== undefined && quest.maxtimeminutes !== undefined &&
          <div className="timing">
            {formatPlayPeriod(quest.mintimeminutes, quest.maxtimeminutes)}
          </div>
        }
        {orderDetails}
        <span className="expansions">
          {props.offlineQuests[quest.id] && <OfflinePin className="inline_icon" />}
          {quest.expansionhorror && <img className="inline_icon" src="images/horror_small.svg"></img>}
          {quest.expansionfuture && <img className="inline_icon" src="images/future_small.svg"></img>}
        </span>
      </div>
    </Button>
  );
}

export function renderResults(props: Props, hideHeader?: boolean): JSX.Element {
  let content: JSX.Element | JSX.Element[];
  const numResults = (props.results || []).length;
  if (numResults === 0 && !props.searching) {
    content = (
      <div className="searchDescription">
        <h2>No quests found</h2>
        {!hideHeader && <span>
          <p>Try broadening the search by using fewer filters.</p>
          <p>If you still see no results, file feedback from the top corner menu.</p>
        </span>}
        <Button className="filter_button" onClick={() => props.onFilter()} id="filter">Modify Search</Button>
      </div>
    );
  } else if (numResults === 0 && props.searching) {
    content = (
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  } else {
    content = (props.results || []).map((quest: Quest, index: number) => {
      return renderResult({
        index,
        quest,
        search: props.search,
        onQuest: props.onQuest,
        lastLogin: props.user.lastLogin,
        lastPlayed: (props.questHistory.list[quest.id] || {}).lastPlayed,
        offlineQuests: props.offlineQuests,
      });
    });
  }

  return (
    <Card
      title="Quest Search Results"
      className="search_card"
      header={(hideHeader) ? undefined : <div className="searchHeader">
        <Button className="searchResultInfo" disabled={true}>{props.results.length} quests for {props.settings.numPlayers} <img className="inline_icon" src="images/adventurer_small.svg"/></Button>
        <Button className="filter_button" onClick={() => props.onFilter()} id="filter">Filter &amp; Sort ></Button>
      </div>}
    >
      {content}
    </Card>
  );
}

// We make this a react component to hold a bit of state and avoid sending
// redux actions for every single change to input.
interface SearchDisclaimerCardProps {
  onLoginRequest: (subscribe: boolean) => void;
}

class SearchDisclaimerCard extends React.Component<SearchDisclaimerCardProps, {}> {
  public state: {
    subscribe: boolean;
  };

  constructor(props: SearchDisclaimerCardProps) {
    super(props);
    this.state = {
      subscribe: false,
    };
  }

  public onSubscribeChange(value: boolean) {
    this.setState({subscribe: value});
  }

  public render() {
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
        <Button onClick={(e) => this.props.onLoginRequest(this.state.subscribe)}>Continue with Google</Button>
      </Card>
    );
  }
}
function renderDisclaimer(props: Props): JSX.Element {
  return (<SearchDisclaimerCard onLoginRequest={props.onLoginRequest}/>);
}

const Search = (props: Props): JSX.Element => {
  switch (props.phase) {
    case 'DISCLAIMER':
      return renderDisclaimer(props);
    case 'SETTINGS':
      return renderSettings(props);
    case 'SEARCH':
      return renderResults(props);
    case 'PRIVATE':
      return renderResults(props, true);
    default:
      throw new Error('Unknown search phase ' + props.phase);
  }
};

export default Search;
