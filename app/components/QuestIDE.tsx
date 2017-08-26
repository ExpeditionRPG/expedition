import * as React from 'react'

import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import {AnnotationType} from '../reducers/StateTypes'
import AppContainer from './AppContainer'

export interface QuestIDEStateProps {
  annotations: AnnotationType[];
  lastSplitPaneDragMillis: number;
  line: number;
  realtime: any;
  realtimeModel: any;
};

export interface QuestIDEDispatchProps {
  onDirty: (realtime: any, text: string) => void;
  onLine: (line: number) => void;
}

interface QuestIDEProps extends QuestIDEStateProps, QuestIDEDispatchProps {}


const QuestIDE = (props: QuestIDEProps): JSX.Element => {
  return (
    <div className="quest_ide">
      <div className="editor">
        <TextView
          realtime={props.realtime}
          realtimeModel={props.realtimeModel}
          annotations={props.annotations}
          lastSizeChangeMillis={props.lastSplitPaneDragMillis}
          scrollLineTarget={props.line}
          onChange={(text: string) => props.onDirty(props.realtime, text)}
          onLine={(line: number) => props.onLine(line)} />
      </div>
      <div className="preview">
        <AppContainer/>
      </div>
    </div>
  );
}

export default QuestIDE;
