import DoneIcon from '@material-ui/icons/Done';
import OfflinePin from '@material-ui/icons/OfflinePin';
import StarsIcon from '@material-ui/icons/Stars';
import * as React from 'react';
import Truncate from 'react-truncate';
import {Quest} from 'shared/schema/Quests';
import {formatPlayPeriod, smartTruncateSummary} from '../../Format';
import {SearchParams, SearchState, SettingsType, UserQuestHistory, UserState} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';
import StarRating from '../base/StarRating';

const Moment = require('moment');

export interface StateProps extends SearchState {
  isDirectLinked: boolean;
  params: SearchParams;
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
}

export interface Props extends StateProps, DispatchProps {}

export interface SearchResultProps {
  index: number;
  lastLogin: Date;
  lastPlayed: Date | null;
  onQuest: (quest: Quest) => void;
  quest: Quest;
  params: SearchParams;
  offlineQuests: {[id: string]: boolean};
}

export function renderResult(props: SearchResultProps): JSX.Element {
  const orderField = props.params.order && props.params.order.substring(1);
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

export function search(props: Props): JSX.Element {

  // TODO Use BUNDLED_QUESTS when user not logged in

  // TODO Private quests
  /*
  <Button id="selectPrivateQuests" onClick={() => props.onPrivateQuestsSelect(props.settings, props.user)}>
    <div className="questButtonWithIcon">
      <div className="title">Private Quests</div>
      <div className="summary">View quests you've published privately with the Quest Creator (uses your current player count!)</div>
    </div>
  </Button>
  dispatch(ensureLogin())
        .then((u: UserState) => {
          return dispatch(search({
            params: {
              order: '-published',
              owner: u.id,
              partition: 'expedition-private',
            },
            settings: {
              ...settings,
              contentSets: {
                horror: true,
              },
            },
          }));
        });
  */

  let content: JSX.Element | JSX.Element[];
  const numResults = (props.results || []).length;
  if (numResults === 0 && !props.searching) {
    content = (
      <div className="searchDescription">
        <h2>No quests found</h2>
        <span>
          <p>Try broadening the search by using fewer filters.</p>
          <p>If you still see no results, file feedback from the top corner menu.</p>
        </span>
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
        params: props.params,
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
      header={<div className="searchHeader">
        <Button className="searchResultInfo" disabled={true}>{props.results.length} quests for {props.settings.numPlayers} <img className="inline_icon" src="images/adventurer_small.svg"/></Button>
        <Button className="filter_button" onClick={() => props.onFilter()} id="filter">Filter &amp; Sort ></Button>
      </div>}
    >
      {content}
    </Card>
  );
}

export default search;
