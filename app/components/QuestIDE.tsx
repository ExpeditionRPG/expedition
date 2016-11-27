import * as React from 'react'

import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import {DirtyState, QuestType, AnnotationType} from '../reducers/StateTypes'
import AppContainer from './AppContainer'

export interface QuestIDEStateProps {
  dirty: DirtyState;
  realtime: any;
  quest: QuestType;
  annotations: AnnotationType[];
};

export interface QuestIDEDispatchProps {
  onDirty: (realtime: any, dirty: DirtyState, quest: QuestType, text: string) => void;
}

interface QuestIDEProps extends QuestIDEStateProps, QuestIDEDispatchProps {}


const QuestIDE = (props: QuestIDEProps): JSX.Element => {
  return (
    <div className="quest_ide">
      <div className="editor">
        <TextView
          realtime={props.realtime}
          annotations={props.annotations}
          onChange={(text: string) => props.onDirty(props.realtime, props.dirty, props.quest, text)} />
      </div>
      <div className="preview">
        <AppContainer/>
      </div>
    </div>
  );
}

export default QuestIDE;
