import * as React from 'react'

import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import {DirtyState, QuestType} from '../reducers/StateTypes'
import AppContainer from './AppContainer'

export interface QuestIDEStateProps {
  dirty: DirtyState;
  realtime: any;
  quest: QuestType;
};

export interface QuestIDEDispatchProps {
  onDirty: (realtime: any, dirty: DirtyState, quest: QuestType, text: string) => void;
}

interface QuestIDEProps extends QuestIDEStateProps, QuestIDEDispatchProps {}


const QuestIDE = (props: QuestIDEProps): JSX.Element => {
  // TODO: Add AppContainer
  return (
    <span className="quest_ide">
      <div>
        <TextView
          realtime={props.realtime}
          onChange={(text: string) => props.onDirty(props.realtime, props.dirty, props.quest, text)} />
      </div>
    </span>
  );
}

export default QuestIDE;
