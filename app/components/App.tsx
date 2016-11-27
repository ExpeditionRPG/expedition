import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main.tsx'

import FlatButton from 'material-ui/FlatButton'

require('expedition-app/app/style.scss')

import CombinedReducers from 'expedition-app/app/reducers/CombinedReducers'
import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'
import {EditorState} from '../reducers/StateTypes'

export interface AppStateProps {
  editor: EditorState;
}

export interface AppDispatchProps {
  playFromCursor: (editor: EditorState) => void;
  playFromStart: (editor: EditorState) => void;
}

interface AppProps extends AppStateProps, AppDispatchProps {}

const App = (props: AppProps): JSX.Element => {
  return (
    <div className="app">
      <FlatButton
        label="Play from Cursor"
        onTouchTap={(event: any) => props.playFromCursor(props.editor)} />
      <FlatButton
        label="Play from Start"
        onTouchTap={(event: any) => props.playFromStart(props.editor)} />
      <Main/>
    </div>
  );
};

export default App;