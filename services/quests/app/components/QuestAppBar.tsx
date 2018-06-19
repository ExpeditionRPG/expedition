import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {Toolbar, ToolbarGroup} from '@material-ui/core/Toolbar'
import AlertError from '@material-ui/icons/error'
import NavigationArrowDropDown from '@material-ui/icons/arrowDropDown'
import SyncIcon from '@material-ui/icons/sync'
import {QuestActionType} from '../actions/ActionTypes'
import {AnnotationType, QuestType, UserState, EditorState} from '../reducers/StateTypes'

export interface QuestAppBarStateProps {
  annotations: AnnotationType[];
  quest: QuestType;
  editor: EditorState;
  user: UserState;
  scope: any;
};

export interface QuestAppBarDispatchProps {
  onMenuSelect: (action: QuestActionType, quest: QuestType) => void;
  onUserDialogRequest: (user: UserState)=>void;
  onViewError: (annotations: AnnotationType[], editor: EditorState) => void;
  playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const questLoaded = (props.quest.id !== null);
  const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = props.quest.title || 'unsaved quest';

  let saveIndicator = <span className="saveIndicator"><Button label="Saving..." icon={<SyncIcon />} disabled={true} /></span>;
  if (props.editor.dirtyTimeout !== null) {
    // saving - default (overrides other cases)
  } else if (props.quest.saveError) {
    saveIndicator = <span className="error saveIndicator"><Button label="Error: unable to save" icon={<AlertError />} disabled={true} /></span>
  } else if (!props.editor.dirty) {
    saveIndicator = <span className="success saveIndicator"><Button label="All changes saved" disabled={true} /></span>
  }

  let publishButton = <Button
    label={(props.quest.published) ? 'Update' : 'Publish'}
    disabled={!questLoaded}
    onClick={(event: any) => props.onMenuSelect('PUBLISH_QUEST', props.quest)} />;
  const errors = props.annotations.filter((annotation) => { return annotation.type === 'error' });
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
    <span className="quest_app_bar">
      <AppBar
        title={questTitle}
        showMenuIconButton={false}
        iconElementRight={
          <div className="appBarRight">
            <a href="https://expeditiongame.com/loot" target="_blank" className="lootPoints">
              {props.user.lootPoints} <img className="inline_icon" src="images/loot_white_small.svg" />
            </a>
            <span className="email">{props.user.email}</span>
            <Menu
              className="loginState"
              iconButtonElement={
                <IconButton><NavigationArrowDropDown /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
              <MenuItem disabled={true}>{loginText}</MenuItem>
              <MenuItem onClick={() => props.onUserDialogRequest(props.user)}>Sign Out</MenuItem>
            </Menu>
          </div>
        }
      />
      <Toolbar className="toolbar">
        <ToolbarGroup firstChild={true}>
          <Button onClick={(event: any) => props.onMenuSelect('NEW_QUEST', props.quest)}>New</Button>
          {publishButton}
          {Boolean(props.quest.published) && <Button onClick={(event: any) => props.onMenuSelect('UNPUBLISH_QUEST', props.quest)}>Unpublish</Button>}
          <Button disabled={!questLoaded} onClick={(event: any) => props.onMenuSelect('DRIVE_VIEW', props.quest)}>View in Drive</Button>
          <Button onClick={(event: any) => props.onMenuSelect('HELP', props.quest)}>Help</Button>
          {saveIndicator}
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <Button onClick={(event: any) => props.playFromCursor({}, props.editor, props.quest)}>
            Play from Cursor
          </Button>
          {props.editor.bottomPanel &&
            <Button onClick={(event: any) => props.playFromCursor(props.scope, props.editor, props.quest)}>
              Play from Cursor (preserve context)
            </Button>
          }
        </ToolbarGroup>
      </Toolbar>
    </span>
  );
}

export default QuestAppBar;
