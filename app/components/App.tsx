import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main.tsx'
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton'
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';

require('expedition-app/app/style.scss')

import CombinedReducers from 'expedition-app/app/reducers/CombinedReducers'
import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'
import {EditorState, QuestType} from '../reducers/StateTypes'

export interface AppStateProps {
  editor: EditorState;
  quest: QuestType;
}

export interface AppDispatchProps {
  onPlay: (editor: EditorState, quest: QuestType) => void;
  openInitialStateDialog: () => void;
  onPlaySettingChange: (e: any, index: number, menuItemValue: any) => void;
}

interface AppProps extends AppStateProps, AppDispatchProps {}

const App = (props: AppProps): JSX.Element => {
  return (
    <div className="app_root">
      <div className="app_controls">
        <DropDownMenu value={props.editor.playFrom} onChange={props.onPlaySettingChange}>
          <MenuItem value={"cursor"} primaryText="Play from Cursor" />
          <MenuItem value={"start"} primaryText="Play from Start" />
        </DropDownMenu>
        <IconButton
          onTouchTap={(event: any) => props.onPlay(props.editor, props.quest)} >
          <PlayIcon/>
        </IconButton>
        <IconButton onTouchTap={(event: any) => props.openInitialStateDialog()}>
          <SettingsIcon/>
        </IconButton>
      </div>
      <div className="app editor_override">
        <Main/>
      </div>
    </div>
  );
};

export default App;