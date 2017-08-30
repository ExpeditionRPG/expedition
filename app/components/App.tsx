import * as React from 'react'

import AppContainer from 'expedition-app/app/components/base/AppContainer'
import FlatButton from 'material-ui/FlatButton'

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
        <AppContainer/>
      </div>
    </div>
  );
};

export default App;
