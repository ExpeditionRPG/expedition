import * as React from 'react'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import DialogsContainer from './DialogsContainer'
import SplashContainer from './SplashContainer'
import QuestAppBarContainer from './QuestAppBarContainer'
import QuestIDEContainer from './QuestIDEContainer'
import ContextEditorContainer from './ContextEditorContainer'
import NotesPanelContainer from './NotesPanelContainer'
import {EditorState, PanelType, SnackbarState, QuestType} from '../reducers/StateTypes'

const numeral = require('numeral') as any;
const SplitPane = require('react-split-pane') as any;

export interface MainStateProps {
  editor: EditorState;
  loggedIn: boolean;
  bottomPanel: PanelType;
  snackbar: SnackbarState;
  quest: QuestType;
};

export interface MainDispatchProps {
  onDragFinished: (size: number) => void;
  onLineNumbersToggle: () => void;
  onPanelToggle: (panel: PanelType) => void;
  onSnackbarClose: () => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.editor.loadingQuest) {
    return (
      <div className="main loading">
        Loading Expedition Quest Creator...
        <div className="slowLoadPrompt">
          Not loading? Try disabling your ad blocker. If that doesn't work, hit the "Contact Us" button in the bottom right - make sure to include the title of your quest.
        </div>
      </div>
    );
  } else if (props.loggedIn === false || Object.keys(props.quest).length === 0) {
    return (
      <SplashContainer/>
    );
  }

  const header = (
    <div className="header">
      <Button
        color={props.bottomPanel === 'CONTEXT' ? 'primary' : 'secondary'}
        onClick={(event: any) => {props.onPanelToggle('CONTEXT');}}
      >Context Explorer</Button>
      <Button
        color={props.bottomPanel === 'NOTES' ? 'primary' : 'secondary'}
        onClick={(event: any) => {props.onPanelToggle('NOTES');}}
      >Quest Notes</Button>
      <div className="bottomPanel--right">
        <Button onClick={(event: any) => {props.onLineNumbersToggle();}}>
          {`Line: ${numeral(props.editor.line.number).format('0,0')}`}
        </Button>
        <Button disabled={true}>
          {`Words: ${props.editor.wordCount > 0 ? numeral(props.editor.wordCount).format('0,0') : '-'}`}
        </Button>
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
        message={<span>{props.snackbar.message}</span>}
        action={(props.snackbar.actionLabel) ? [<Button key={1} onClick={(e: React.MouseEvent<HTMLElement>) => {props.snackbar.action && props.snackbar.action()}}>{this.props.snackbar.actionLabel}</Button>] : []}
        autoHideDuration={(props.snackbar.persist) ? undefined : 4000}
        onClose={props.onSnackbarClose}
      />
    </div>
  );
}

export default Main;
