import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import {Tab} from 'material-ui/Tabs'

import TextView from './base/TextView'
import DialogsContainer from './DialogsContainer'
import SplashContainer from './SplashContainer'
import QuestAppBarContainer from './QuestAppBarContainer'
import QuestIDEContainer from './QuestIDEContainer'
import ContextEditorContainer from './ContextEditorContainer'
import NotesPanelContainer from './NotesPanelContainer'
import {EditorState, PanelType, SnackbarState} from '../reducers/StateTypes'

const SplitPane = require('react-split-pane') as any;

export interface MainStateProps {
  editor: EditorState;
  loggedIn: boolean;
  bottomPanel: PanelType;
  snackbar: SnackbarState;
};

export interface MainDispatchProps {
  onDragFinished: (size: number) => void;
  onPanelToggle: (panel: PanelType) => void;
  onSnackbarClose: () => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.loggedIn === null || props.loggedIn === undefined) {
    return (
      <div className="main loading">
        Loading Expedition Quest Creator...
      </div>
    );
  } else if (props.loggedIn !== true) {
    return (
      <SplashContainer/>
    );
  }

  const header = (
    <div className="header">
      <FlatButton
        label="Context Explorer"
        secondary={props.bottomPanel !== 'CONTEXT'}
        onTouchTap={(event: any) => {props.onPanelToggle('CONTEXT');}}
      />
      <FlatButton
        label="Quest Notes"
        secondary={props.bottomPanel !== 'NOTES'}
        onTouchTap={(event: any) => {props.onPanelToggle('NOTES');}}
      />
      <div className="bottomPanel--right">
        <FlatButton
          label={`Line: ${props.editor.line.number}`}
          disabled={true}
        />
        {props.editor.wordCount > 0 && <FlatButton
          label={`Words: ${props.editor.wordCount}`}
          disabled={true}
        />}
      </div>
    </div>
  );

  // TODO: Constant-ify default size of split pane
  let contents = <span></span>;
  if (!props.bottomPanel) {
    contents = (
      <div className="contents">
        <QuestIDEContainer/>
        <div className="bottomPanel">
          {header}
        </div>
      </div>);
  } else {
    // SplitPane dimensions are measured as the size of the *editor* pane, not the bottom pane.
    contents = (<div className="contents"><SplitPane
      split="horizontal"
      defaultSize={window.innerHeight - 400}
      minSize={40}
      maxSize={window.innerHeight - 120}
      onDragFinished={(size: number) => {props.onDragFinished(size)}}>
        <QuestIDEContainer/>
        <div className="bottomPanel">
          {header}
          {props.bottomPanel === 'CONTEXT' && <ContextEditorContainer/>}
          {props.bottomPanel === 'NOTES' && <NotesPanelContainer/>}
        </div>
      </SplitPane></div>);
  }

  return (
    <div className="main">
      <QuestAppBarContainer/>
      <DialogsContainer/>
      {contents}
      <Snackbar
        className="editor_snackbar"
        open={props.snackbar.open}
        message={props.snackbar.message || ''}
        action={props.snackbar.actionLabel}
        autoHideDuration={(props.snackbar.persist) ? null : 4000}
        onActionTouchTap={props.snackbar.action}
        onRequestClose={props.onSnackbarClose}
      />
    </div>
  );
}

export default Main;
