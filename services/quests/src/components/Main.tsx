import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import * as React from 'react';
import {EditorState, PanelType, QuestType, SnackbarState} from '../reducers/StateTypes';
import ContextEditorContainer from './ContextEditorContainer';
import DialogsContainer from './DialogsContainer';
import NotesPanelContainer from './NotesPanelContainer';
import QuestAppBarContainer from './QuestAppBarContainer';
import QuestIDEContainer from './QuestIDEContainer';
import SplashContainer from './SplashContainer';

const numeral = require('numeral') as any;
const SplitPane = require('react-split-pane') as any;

export interface MainStateProps {
  editor: EditorState;
  loggedIn: boolean;
  bottomPanel: PanelType;
  snackbar: SnackbarState;
  quest: QuestType;
}

export interface MainDispatchProps {
  onDragFinished: (size: number) => void;
  onLineNumbersToggle: () => void;
  onPanelToggle: (panel: PanelType) => void;
  onSnackbarClose: () => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

class Main extends React.Component<MainProps, {hasError: Error|null}> {
  constructor(props: MainProps) {
    super(props);
    this.state = { hasError: null };
  }

  public componentDidCatch(error: Error, info: any) {
    // Display fallback UI
    this.setState({ hasError: error });
  }

  public render() {
    if (this.state.hasError) {
      return (<span style={{color: 'white'}}>
          <div>Oh no, an error has occured! Try reloading the page - if the error persists, please email contact@expeditiongame.com with the current page URL + below error message:</div>
          <div>Error: {this.state.hasError.toString()}</div>
        </span>);
    }
    if (this.props.editor.loadingQuest) {
      return (
        <div className="main loading">
          Loading Expedition Quest Creator...
          <div className="slowLoadPrompt">
            Not loading? Try disabling your ad blocker.
            If that doesn't work, hit the "Contact Us" button in the bottom right -
            make sure to include the title of your quest.
          </div>
        </div>
      );
    } else if (this.props.loggedIn === false || Object.keys(this.props.quest).length === 0) {
      return (<SplashContainer/>);
    }

    const header = (
      <div className="header">
        <Button
          className={this.props.bottomPanel === 'CONTEXT' ? 'active' : 'inactive'}
          onClick={(event: any) => {this.props.onPanelToggle('CONTEXT'); }}
        >Context Explorer</Button>
        <Button
          className={this.props.bottomPanel === 'NOTES' ? 'active' : 'inactive'}
          onClick={(event: any) => {this.props.onPanelToggle('NOTES'); }}
        >Quest Notes</Button>
        <div className="bottomPanel--right">
          <Button onClick={(event: any) => {this.props.onLineNumbersToggle(); }}>
            {`Line: ${numeral(this.props.editor.line.number).format('0,0')}`}
          </Button>
          <Button disabled={true}>
            {`Words: ${this.props.editor.wordCount > 0 ? numeral(this.props.editor.wordCount).format('0,0') : '-'}`}
          </Button>
        </div>
      </div>
    );

    // TODO: Constant-ify default size of split pane
    let contents = <span></span>;
    if (!this.props.bottomPanel) {
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
        onDragFinished={(size: number) => {this.props.onDragFinished(size); }}>
          <QuestIDEContainer/>
          <div className="bottomPanel">
            {header}
            {this.props.bottomPanel === 'CONTEXT' && <ContextEditorContainer/>}
            {this.props.bottomPanel === 'NOTES' && <NotesPanelContainer/>}
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
          open={this.props.snackbar.open}
          message={<span>{this.props.snackbar.message}</span>}
          action={(this.props.snackbar.actionLabel) ?
            [<Button key={1}
              // tslint:disable-next-line
              onClick={(e: React.MouseEvent<HTMLElement>) => { this.props.snackbar.action && this.props.snackbar.action(); }}>
                {this.props.snackbar.actionLabel}
            </Button>] :
            []}
          autoHideDuration={(this.props.snackbar.persist) ? undefined : 4000}
          onClose={this.props.onSnackbarClose}
        />
      </div>
    );
  }
}

export default Main;
