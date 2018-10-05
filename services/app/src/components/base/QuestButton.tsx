import * as React from 'react';
import Truncate from 'react-truncate';
import {Quest} from 'shared/schema/Quests';
import {formatPlayPeriod, smartTruncateSummary} from '../../Format';
import Button from '../base/Button';

const Moment = require('moment');

export interface Props {
  lastLogin: Date;
  isOffline: boolean;
  isPrivate: boolean;
  lastPlayed: Date | null;
  quest: Quest;
  id?: string;
  onClick?: () => void;
}

export default class QuestButton extends React.Component<Props, {}> {
  public render() {
    const quest = this.props.quest;
    const classes = ['questButton'];
    if (this.props.lastPlayed) {
      classes.push('played');
    }

    return (
      <Button onClick={() => {if (this.props.onClick) {this.props.onClick(); }}} id={this.props.id}>
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
                  {(this.props.lastLogin < quest.created || Moment().diff(quest.created, 'days') <= 7) && !this.props.lastPlayed &&
                    <div className="badge">NEW</div>}
                  {this.props.lastPlayed && <img className="inline_icon" src="images/checkmark_small.svg"/>}
                  {quest.official && <span className="indicator_spacer"><img className="inline_icon questOfficialIcon" src="images/logo_outline_small.svg"/></span>}
                  {quest.awarded && <img className="inline_icon" src="images/starcircle_small.svg"/>}
                  {this.props.isPrivate && <img className="inline_icon" src="images/private_small.svg"/>}
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
          {this.props.children}
          <span className="expansions">
            {this.props.isOffline && <img className="inline_icon" src="images/offline_small.svg"/>}
            {quest.expansionhorror && <img className="inline_icon" src="images/horror_small.svg"/>}
            {quest.expansionfuture && <img className="inline_icon" src="images/future_small.svg"/>}
          </span>
        </div>
      </Button>
    );
  }
}
