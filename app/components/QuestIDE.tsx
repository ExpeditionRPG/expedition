import * as React from 'react'

import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import {QuestType, EditorState, AnnotationType} from '../reducers/StateTypes'
import AppContainer from './AppContainer'

export interface QuestIDEStateProps {
  realtime: any;
  quest: QuestType;
  editor: EditorState;
  annotations: AnnotationType[];
};

export interface QuestIDEDispatchProps {
  onDirty: (realtime: any, quest: QuestType, editor: EditorState, text: string) => void;
  onLine: (line: number, editor: EditorState) => void;
}

interface QuestIDEProps extends QuestIDEStateProps, QuestIDEDispatchProps {}


const QuestIDE = (props: QuestIDEProps): JSX.Element => {
  return (
    <div className="quest_ide">
      <div className="editor">
        <TextView
          realtime={props.realtime}
          annotations={props.annotations}
          onChange={(text: string) => props.onDirty(props.realtime, props.quest, props.editor, text)}
          onLine={(line: number) => props.onLine(line, props.editor)} />
      </div>
      <div className="preview">
        <AppContainer/>
      </div>
    </div>
  );
}

export default QuestIDE;
