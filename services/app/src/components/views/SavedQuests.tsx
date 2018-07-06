import * as React from 'react';
import {pluralize, smartTruncateSummary} from '../../Format';
import {SavedQuestMeta} from '../../reducers/StateTypes';
import Button from '../base/Button';
import Card from '../base/Card';

const Moment = require('moment');

export interface SavedQuestsStateProps {
  saved: SavedQuestMeta[];
}

export interface SavedQuestsDispatchProps {
  onSelect: (selected: SavedQuestMeta) => void;
}

export interface SavedQuestsProps extends SavedQuestsStateProps, SavedQuestsDispatchProps {}

interface GroupedQuestSave extends SavedQuestMeta {
  numSaves: number;
}

const SavedQuests = (props: SavedQuestsProps): JSX.Element => {
  if (props.saved.length === 0) {
    return (
      <Card title="Saved & Offline">
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
  const groupedQuestSaves: JSX.Element[] = distinctSaveKeys.map((questID: string, index: number): JSX.Element => {
    const s = distinctSaves[questID];
    return (
      <Button onClick={() => props.onSelect(s)} key={index} id={'quest' + index.toString()}>
        <div className="questButton">
          <div className="title">{s.details.title}</div>
          <div className="summary">{Moment(s.ts).fromNow()} ({pluralize(s.numSaves, 'save')})</div>
        </div>
      </Button>
    );
  });

  const offlineQuests: JSX.Element[] = props.saved.filter((s: SavedQuestMeta) => {
    return (s.pathLen !== undefined && s.pathLen === 0);
  }).map((s: SavedQuestMeta, index: number): JSX.Element => {
    return (
      <Button onClick={() => props.onSelect(s)} key={index} id={'quest' + index.toString()}>
        <div className="questButton">
          <div className="title">{s.details.title}</div>
          <div className="summary">{smartTruncateSummary(s.details.summary)}</div>
        </div>
      </Button>
    );
  });

  return (
    <Card title="Saved & Offline">
      <h3>Saved Quests</h3>
      {groupedQuestSaves}
      <h3>Offline Quests</h3>
      {offlineQuests}
    </Card>
  );
};

export default SavedQuests;
