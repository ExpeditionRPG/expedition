import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main.tsx'
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import ReplayIcon from 'material-ui/svg-icons/av/replay';

require('expedition-app/app/style.scss')

import CombinedReducers from 'expedition-app/app/reducers/CombinedReducers'
import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'
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
        <IconButton
          onTouchTap={(event: any) => props.playFromCursor(props.scope, props.editor, props.quest)}
          tooltip="Play from Cursor" >
          <PlayIcon/>
        </IconButton>
        <IconButton
          onTouchTap={(event: any) => props.playFromCursor({}, props.editor, props.quest)}
          tooltip="Play from Cursor (blank context)" >
          <ReplayIcon/>
        </IconButton>
      </div>
      <div className="app editor_override">
        <Main/>
      </div>
    </div>
  );
};

export default App;