import * as React from 'react';
import {Partition} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {formatPlayPeriod, smartTruncateSummary} from '../../Format';
import Button from '../base/Button';

const Moment = require('moment');

export interface Props {
  lastLogin: Date;
  lastPlayed: Date | null;
  isOffline: boolean;
  quest: Quest;
  summary?: string;
  id?: string;
  onClick?: () => void;
}

export default class QuestButton extends React.Component<Props, {}> {
  public render() {
    const quest = this.props.quest;
    const summary = this.props.summary || quest.summary;
    const classes = ['questButton'];
    if (this.props.lastPlayed) {
      classes.push('played');
    }
    const isNew = Boolean(!quest.official && (this.props.lastLogin < quest.created || Moment().diff(quest.created, 'days') <= 7 || quest.ratingcount < 5) && !this.props.lastPlayed);
    return (
      <Button onClick={() => {if (this.props.onClick) {this.props.onClick(); }}} id={this.props.id}>
        <div className={classes.join(' ')}>
          <div className="searchResultsTitleTable">
            <div className="leftcell twoLinesMax">
              {quest.title}
            </div>
          </div>
          <div className="summary threeLinesMax">
            {smartTruncateSummary(summary || '')}
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
            {quest.expansionwyrmsgiants && <img className="inline_icon" src="images/beast_small.svg"/>}
            {quest.expansionscarredlands && <img className="inline_icon" src="images/titanspawn_small.svg"/>}
          </span>
          <span className="rightcell">
            {isNew && <img className="inline_icon" src="images/seedling_small.svg"/>}
            {this.props.lastPlayed && <img className="inline_icon" src="images/checkmark_small.svg"/>}
            {quest.official && <span className="indicator_spacer"><img className="inline_icon questOfficialIcon" src="images/logo_outline_small.svg"/></span>}
            {quest.awarded && <img className="inline_icon" src="images/trophy_small.svg"/>}
            {quest.partition === Partition.expeditionPrivate && <img className="inline_icon" src="images/private_small.svg"/>}
          </span>
        </div>
      </Button>
    );
  }
}
