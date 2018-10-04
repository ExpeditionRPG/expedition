import DoneIcon from '@material-ui/icons/Done';
import OfflinePin from '@material-ui/icons/OfflinePin';
import StarsIcon from '@material-ui/icons/Stars';
import * as React from 'react';
import Truncate from 'react-truncate';
import {Quest} from 'shared/schema/Quests';
import {formatPlayPeriod, smartTruncateSummary} from '../../Format';
import Button from '../base/Button';
import StarRating from '../base/StarRating';

const Moment = require('moment');

export type SubfieldType = 'ratingavg'|'created';

export interface Props {
  lastLogin: Date;
  isOffline: boolean;
  lastPlayed: Date | null;
  quest: Quest;
  id?: string;
  onClick?: () => void;
  subfield?: SubfieldType;
}

export default function questButton(props: Props): JSX.Element {
  const quest = props.quest;
  let details = <span></span>;
  if (props.subfield) {
    const ratingCount = quest.ratingcount || 0;
    const ratingAvg = quest.ratingavg || 0;
    details = (
      <div className={`searchOrderDetail ${props.subfield}`}>
        {props.subfield === 'ratingavg' && ratingCount >= 1 && <StarRating readOnly={true} value={+ratingAvg} quantity={ratingCount}/>}
        {props.subfield === 'created' && ('Published ' + Moment(quest.created).format('MMM YYYY'))}
      </div>
    );
  }
  const classes = ['searchResult'];
  if (props.lastPlayed) {
    classes.push('played');
  }

  return (
    <Button onClick={() => {if (props.onClick) {props.onClick(); }}} id={props.id}>
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
        {details}
        <span className="expansions">
          {props.isOffline && <OfflinePin className="inline_icon" />}
          {quest.expansionhorror && <img className="inline_icon" src="images/horror_small.svg"></img>}
          {quest.expansionfuture && <img className="inline_icon" src="images/future_small.svg"></img>}
        </span>
      </div>
    </Button>
  );
}
