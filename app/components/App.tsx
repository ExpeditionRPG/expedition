import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main'
import FlatButton from 'material-ui/FlatButton'

require('expedition-app/app/style.scss')

import {EditorState, QuestType} from '../reducers/StateTypes'

export interface AppStateProps {
  // TODO Cleanup
  editor: EditorState;
  quest: QuestType;
  scope: any;
}

export interface AppDispatchProps {
}

interface AppProps extends AppStateProps, AppDispatchProps {}

const App = (props: AppProps): JSX.Element => {
  return (
    <div className="app_root">
      <div className="app editor_override">
        <Main/>
      </div>
    </div>
  );
};

export default App;