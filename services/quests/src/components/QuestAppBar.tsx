import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import NavigationArrowDropDown from '@material-ui/icons/ArrowDropDown';
import AlertError from '@material-ui/icons/Error';
import SyncIcon from '@material-ui/icons/Sync';
import * as React from 'react';
import {QuestActionType} from '../actions/ActionTypes';
import {AnnotationType, EditorState, QuestType, UserState} from '../reducers/StateTypes';

export interface QuestAppBarStateProps {
  annotations: AnnotationType[];
  quest: QuestType;
  editor: EditorState;
  user: UserState;
  scope: any;
}

export interface QuestAppBarDispatchProps {
  onMenuSelect: (action: QuestActionType, quest: QuestType) => void;
  onUserDialogRequest: (user: UserState) => void;
  onViewError: (annotations: AnnotationType[], editor: EditorState) => void;
  playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const questLoaded = (props.quest.id !== null);
  // const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = props.quest.title || 'unsaved quest';

  let saveIndicator = <span className="saveIndicator"><Button disabled={true}><SyncIcon /> Saving...</Button></span>;
  if (props.editor.dirtyTimeout !== null) {
    // saving - default (overrides other cases)
  } else if (props.quest.saveError) {
    saveIndicator = <span className="error saveIndicator"><Button disabled={true}><AlertError /> Error: unable to save</Button></span>;
  } else if (!props.editor.dirty) {
    saveIndicator = <span className="success saveIndicator"><Button disabled={true}>All changes saved</Button></span>;
  }

  let publishButton = <Button disabled={!questLoaded} onClick={(event: any) => props.onMenuSelect('PUBLISH_QUEST', props.quest)}>
    {(props.quest.published) ? 'Update' : 'Publish'}
  </Button>;
  const errors = props.annotations.filter((annotation) => annotation.type === 'error');
  const validating = (props.editor.worker !== null);
  if (validating) {
    publishButton = <span className="validatingButton">
      <Button disabled={true}>
        <CircularProgress size={28} thickness={6} /> Validating...
      </Button>
    </span>;
  } else if (errors.length > 0) {
    const errorLabel = (errors.length > 1) ? 'View Errors' : 'View Error';
    publishButton = <span className="errorButton">
      <Button onClick={(event: any) => props.onViewError(props.annotations, props.editor)}>
        <AlertError /> {errorLabel}
      </Button>
    </span>;
  }

  return (
    <AppBar className="quest_app_bar">
      <Toolbar>
        <Typography variant="title">
          {questTitle}
        </Typography>
        <a href="https://expeditiongame.com/loot" target="_blank" className="lootPoints">
          {props.user.lootPoints} <img className="inline_icon" src="images/loot_white_small.svg" />
        </a>
        <span className="email">{props.user.email}</span>
      </Toolbar>
      <Toolbar>
        <Button onClick={(event: any) => props.onMenuSelect('NEW_QUEST', props.quest)}>New</Button>
        {publishButton}
        {Boolean(props.quest.published) && <Button onClick={(event: any) => props.onMenuSelect('UNPUBLISH_QUEST', props.quest)}>Unpublish</Button>}
        <Button disabled={!questLoaded} onClick={(event: any) => props.onMenuSelect('DRIVE_VIEW', props.quest)}>View in Drive</Button>
        <Button onClick={(event: any) => props.onMenuSelect('HELP', props.quest)}>Help</Button>
        {saveIndicator}
        <Button onClick={(event: any) => props.playFromCursor({}, props.editor, props.quest)}>
          Play from Cursor
        </Button>
        {props.editor.bottomPanel &&
          <Button onClick={(event: any) => props.playFromCursor(props.scope, props.editor, props.quest)}>
            Play from Cursor (preserve context)
          </Button>
        }
      </Toolbar>
    </AppBar>
  );
};

export default QuestAppBar;
