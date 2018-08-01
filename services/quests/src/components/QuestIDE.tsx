import CompositorContainer from 'app/components/CompositorContainer';
import {getStore as getAppStore} from 'app/Store';
import * as React from 'react';
import {Provider} from 'react-redux';
import {AnnotationType, TutorialState} from '../reducers/StateTypes';
import TextView from './base/TextView';

export interface StateProps {
  annotations: AnnotationType[];
  lastSplitPaneDragMillis: number;
  line: number;
  lineTs: number;
  realtime: any;
  realtimeModel: any;
  showLineNumbers: boolean;
  showSpellcheck: boolean;
  tutorial: TutorialState;
}

export interface DispatchProps {
  onAnnotationClick: (annotations: number[]) => void;
  onDirty: (realtime: any, text: string) => void;
  onLine: (line: number) => void;
}

interface Props extends StateProps, DispatchProps {}

const QuestIDE = (props: Props): JSX.Element => {
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
        {props.tutorial.playFromCursor &&
          <div className="play-from-cursor-tutorial">Click "Play from Cursor" above<br/>to test your quest.</div>
        }
        <div className="app_root">
          <div className="app editor_override">
            <Provider store={getAppStore()}>
              <CompositorContainer />
            </Provider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestIDE;
