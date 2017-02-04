import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main'
import FlatButton from 'material-ui/FlatButton'

require('expedition-app/app/style.scss')

import {EditorState, QuestType} from '../reducers/StateTypes'

export interface AppStateProps {
  editor: EditorState;
  quest: QuestType;
  scope: any;
}

export interface AppDispatchProps {
  playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => void;
}

interface AppProps extends AppStateProps, AppDispatchProps {}

const App = (props: AppProps): JSX.Element => {
  return (
    <div className="app_root">
      <div className="app_controls">
        <FlatButton
          onTouchTap={(event: any) => props.playFromCursor(props.scope, props.editor, props.quest)} 
          label="Play from Cursor">
        </FlatButton>
        <FlatButton
          onTouchTap={(event: any) => props.playFromCursor({}, props.editor, props.quest)}
          label="Play from Cursor (blank context)">
        </FlatButton>
      </div>
      <div className="app editor_override">
        <Main/>
      </div>
    </div>
  );
};

export default App;