import * as React from 'react';
import {SavedQuestMeta} from '../../reducers/StateTypes';
import Card from '../base/Card';
import QuestButtonContainer from '../base/QuestButtonContainer';
import TextDivider from '../base/TextDivider';

const pluralize = require('pluralize');
const Moment = require('moment');

export interface StateProps {
  saved: SavedQuestMeta[];
}

export interface DispatchProps {
  onSelect: (selected: SavedQuestMeta) => void;
}

export interface Props extends StateProps, DispatchProps {}

interface GroupedQuestSave extends SavedQuestMeta {
  numSaves: number;
}

const SavedQuests = (props: Props): JSX.Element => {
  if (props.saved.length === 0) {
    return (
      <Card title="Saved & Offline Quests">
        <p>You have no saved/offline quests.</p>
        <p>To save your position in a quest, open the top right menu while playing
           and select "Save Quest".</p>
        <p>To save a quest to play offline, click "Save for Offline" on a quest preview page.</p>
        <p>Quests are saved to your device and are available without an internet
           connection.</p>
      </Card>
    );
  }

  const saves = props.saved.filter((s: SavedQuestMeta) => {
    return (s.pathLen === undefined || s.pathLen > 0);
  });
  const distinctSaves: {[questID: string]: GroupedQuestSave} = {};
  for (const s of saves) {
    if (distinctSaves[s.details.id] === undefined) {
      distinctSaves[s.details.id] = {...s, numSaves: 1};
      continue;
    }

    const ds = distinctSaves[s.details.id];
    distinctSaves[s.details.id] = {
      details: ds.details,
      ts: Math.max(ds.ts || 0, s.ts),
      pathLen: Math.max(ds.pathLen || 0, s.pathLen || 0),
      numSaves: ds.numSaves + 1,
    };
  }
  const distinctSaveKeys = Object.keys(distinctSaves);
  distinctSaveKeys.sort((a, b) => distinctSaves[b].ts - distinctSaves[a].ts);
  const groupedQuestSaves: JSX.Element[] = distinctSaveKeys.map((questID: string, i: number): JSX.Element => {
    const s = distinctSaves[questID];
    return (
      <QuestButtonContainer key={i} id={`quest${i}`} quest={s.details} onClick={() => props.onSelect(s)}>
        <span className="details">{Moment(s.ts).fromNow()} ({s.numSaves} {pluralize('save', s.numSaves)})</span>
      </QuestButtonContainer>
    );
  });

  const offlineQuests: JSX.Element[] = props.saved.filter((s: SavedQuestMeta) => {
    return (s.pathLen !== undefined && s.pathLen === 0);
  }).map((s: SavedQuestMeta, i: number): JSX.Element => {
    return (<QuestButtonContainer key={i} id={`quest${i}`} quest={s.details} onClick={() => props.onSelect(s)}/>);
  });

  return (
    <Card title="Saved & Offline Quests" onReturn={null}>
      {groupedQuestSaves.length > 0 && <span>
        <TextDivider text="Saved Quests"/>
        {groupedQuestSaves}
      </span>}
      {offlineQuests.length > 0 && <span>
        <TextDivider text="Offline Quests"/>
        {offlineQuests}
      </span>}
    </Card>
  );
};

export default SavedQuests;
