import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';
import {numPlayers} from 'app/actions/Settings';
import * as React from 'react';
import {CONTENT_RATING_DESC, enumValues, Genre, Language} from 'shared/schema/Constants';
import {PLAYTIME_MINUTES_BUCKETS} from '../../Constants';
import {ContentSetsType, SearchParams, SettingsType, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import ExpansionCheckbox from '../base/ExpansionCheckbox';

const pluralize = require('pluralize');

export interface StateProps {
  params: SearchParams;
  settings: SettingsType;
  contentSets: Set<keyof ContentSetsType>;
  user: UserState;
}

export interface DispatchProps {
  onChangeParams: (params: Partial<SearchParams>) => void;
  onSearch: (params: SearchParams) => void;
}

export interface Props extends StateProps, DispatchProps {}

export class SearchSettings extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public onChange(attrib: string, value: any) {
    // Have to use 'null' string instead of raw undefined
    // as select value, otherwise HTML auto-populates the value as the display
    // string, which breaks the API (i.e. passing "Any length" instead no value)
    if (value === 'null') {
      this.props.onChangeParams({[attrib]: undefined});
    } else {
      this.props.onChangeParams({[attrib]: value});
    }
  }

  public handleCheckbox(v: boolean) {
    if (v === false) {
      this.onChange('showPrivate', false);
    } else {
      this.onChange('showPrivate', true);
    }
  }

  public submit(e: React.FormEvent | React.MouseEvent | undefined) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSearch(this.props.params);
  }

  // TODO remove the clutter here / move to Theme.tsx
  public render() {
    const players = numPlayers(this.props.settings);
    const rating = (this.props.params.contentrating) ? CONTENT_RATING_DESC[this.props.params.contentrating] : undefined;
    const timeBuckets = PLAYTIME_MINUTES_BUCKETS.map((minutes: number, index: number) => {
      return <option key={index} value={minutes}>{`${minutes} min`}</option>;
    });

    // TODO Once we have 3 romance & SciFi quests, change code to just display genre list
    const visibleGenres: Genre[] = [Genre.comedy, Genre.drama, Genre.horror, Genre.mystery];
    return (
      <Card title="Quest Search">
        <form className="searchForm" autoComplete="off" onSubmit={(e: React.FormEvent) => {this.submit(e); }}>
          <div className="searchDescription">
            For {players} {pluralize('players', players)}
          </div>
          <FormControl fullWidth={true}>
            <FormLabel htmlFor="expansion">Expansion</FormLabel>
            <ExpansionCheckbox
              onChange={(values) => this.onChange('expansions', values)}
              contentSets={this.props.contentSets}
              value={this.props.params.expansions || []}
            />
          </FormControl>
          <FormControl fullWidth={true}>
            <TextField
              id="text"
              className="textfield"
              fullWidth={true}
              label="text search - title, author, ID"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.onChange('text', e.target.value)}
              onFocus={(e: any) => e.target.scrollIntoView()}
              value={this.props.params.text}
            />
          </FormControl>
          <FormControl className="selectfield" fullWidth={true}>
            <InputLabel htmlFor="order">Sort by</InputLabel>
            <NativeSelect
              id="order"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('order', e.target.value)}
              value={this.props.params.order}
            >
              <option value="+ratingavg">Highest rated</option>
              <option value="-created">Newest</option>
              <option value="+title">Title (A-Z)</option>
              <option value="-title">Title (Z-A)</option>
              <option value="">Compatibility</option>
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft ranged">
            <InputLabel htmlFor="mintimeminutes">Minimum time</InputLabel>
            <NativeSelect
              id="mintimeminutes"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('mintimeminutes', e.target.value)}
              value={this.props.params.mintimeminutes}
            >
              <option value={'null'}>Any length</option>
              {timeBuckets}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfRight">
            <InputLabel htmlFor="maxtimeminutes">Maximum time</InputLabel>
            <NativeSelect
              id="maxtimeminutes"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('maxtimeminutes', e.target.value)}
              value={this.props.params.maxtimeminutes}
            >
              <option value={'null'}>Any length</option>
              {timeBuckets}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft">
            <InputLabel htmlFor="age">Recency</InputLabel>
            <NativeSelect
              id="age"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('age', e.target.value)}
              value={this.props.params.age}
            >
              <option value={'null'}>All time</option>
              <option value={31536000}>Published this year</option>
              <option value={2592000}>Published this month</option>
              <option value={604800}>Published this week</option>
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfRight">
            <InputLabel htmlFor="language">Language</InputLabel>
            <NativeSelect
              id="language"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('language', e.target.value)}
              value={this.props.params.language}
            >
              {enumValues(Language).map((l: string, i: number) => <option key={i} value={l}>{l}</option>)}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft">
            <InputLabel htmlFor="genre">Genre</InputLabel>
            <NativeSelect
              id="genre"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('genre', e.target.value)}
              value={this.props.params.genre}
            >
              <option value={'null'}>All genres</option>
              {visibleGenres.map((genre: string, i: number) => <option key={i} value={genre}>{genre}</option>)}
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfRight">
            <InputLabel htmlFor="contentrating">Content Rating</InputLabel>
            <NativeSelect
              id="contentrating"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('contentrating', e.target.value)}
              value={this.props.params.contentrating}
            >
              <option value={'null'}>All ratings</option>
              <option value="Kid-friendly">Kid-friendly</option>
              <option value="Teen">Teen</option>
              <option value="Adult">Adult</option>
            </NativeSelect>
          </FormControl>
          <FormControl className="selectfield halfLeft">
            <InputLabel htmlFor="requirespenpaper">Requires Pen & Paper</InputLabel>
            <NativeSelect
              id="requirespenpaper"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>, c: React.ReactNode) => this.onChange('requirespenpaper', e.target.value)}
              value={this.props.params.requirespenpaper}
            >
              <option value={'null'}>No Preference</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </NativeSelect>
          </FormControl>
          <FormControl fullWidth={true} className="showPrivateControl">
            <FormControlLabel control={
              <Checkbox
                id="showPrivate"
                checked={this.props.params.showPrivate === true ? true : false}
                onChange={(_, v: boolean) => { this.handleCheckbox(v); }}
              />
            } label={'Also show my private quests'}></FormControlLabel>
          </FormControl>
          {rating && <div className="ratingDescription">
            <span>"{this.props.params.contentrating}" rating means: {rating.summary}</span>
          </div>}
          <Button onClick={(e: React.FormEvent) => {this.submit(e); }} id="search">Search</Button>
        </form>
      </Card>
    );
  }
}

export default SearchSettings;
