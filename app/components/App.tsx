import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main.tsx'

import FlatButton from 'material-ui/FlatButton'

require('expedition-app/app/style.scss')

import CombinedReducers from 'expedition-app/app/reducers/CombinedReducers'
import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'
import {EditorState, QuestType} from '../reducers/StateTypes'

export interface AppStateProps {
  editor: EditorState;
  quest: QuestType;
}

export interface AppDispatchProps {
  playFromCursor: (editor: EditorState, quest: QuestType) => void;
  playFromStart: (editor: EditorState, quest: QuestType) => void;
}

interface AppProps extends AppStateProps, AppDispatchProps {}

const App = (props: AppProps): JSX.Element => {
  return (
    <div className="app_root">
      <div className="app_controls">
        <FlatButton
          label="Play from Cursor"
          onTouchTap={(event: any) => props.playFromCursor(props.editor, props.quest)} />
        <FlatButton
          label="Play from Start"
          onTouchTap={(event: any) => props.playFromStart(props.editor, props.quest)} />
      </div>
      <div className="app editor_override">
        <Main/>
      </div>
    </div>
  );
};

export default App;