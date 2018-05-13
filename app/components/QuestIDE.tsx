import * as React from 'react'

import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import {AnnotationType, TutorialState} from '../reducers/StateTypes'
import AppContainer from './AppContainer'

export interface QuestIDEStateProps {
  annotations: AnnotationType[];
  lastSplitPaneDragMillis: number;
  line: number;
  lineTs: number;
  realtime: any;
  realtimeModel: any;
  showLineNumbers: boolean;
  showSpellcheck: boolean;
  tutorial: TutorialState;
};

export interface QuestIDEDispatchProps {
  onDirty: (realtime: any, text: string) => void;
  onLine: (line: number) => void;
  onAnnotationClick: (annotations: number[]) => void;
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
          scrollLineTargetTs={props.lineTs}
          showLineNumbers={props.showLineNumbers}
          showSpellcheck={props.showSpellcheck}
          onChange={(text: string) => props.onDirty(props.realtime, text)}
          onLine={(line: number) => props.onLine(line)}
          onAnnotationClick={(annotations: number[]) => props.onAnnotationClick(annotations)} />
      </div>
      <div className="preview">
        {props.tutorial.playFromCursor && <div className="play-from-cursor-tutorial">Click "Play from Cursor" above<br/>to test your quest.</div>}
        <AppContainer/>
        }
      </div>
    </div>
  );
}

export default QuestIDE;
