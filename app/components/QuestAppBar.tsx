import * as React from 'react'

import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'

import AlertError from 'material-ui/svg-icons/alert/error'
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down'
import SyncIcon from 'material-ui/svg-icons/notification/sync'

import {QuestActionType} from '../actions/ActionTypes'
import {AnnotationType, QuestType, UserState, EditorState, ValidState} from '../reducers/StateTypes'

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

  let saveIndicator = <span className="saveIndicator"><FlatButton label="Saving..." icon={<SyncIcon />} disabled={true} /></span>;
  if (props.editor.dirtyTimeout !== null) {
    // saving - default (overrides other cases)
  } else if (props.quest.saveError) {
    saveIndicator = <span className="error saveIndicator"><FlatButton label="Error: unable to save" icon={<AlertError />} disabled={true} /></span>
  } else if (!props.editor.dirty) {
    saveIndicator = <span className="success saveIndicator"><FlatButton label="All changes saved" disabled={true} /></span>
  }
  const errors = props.annotations.filter((annotation) => { return annotation.type === 'error' });
  const errorLabel = (errors.length > 1) ? 'View Errors' : 'View Error';
  const publishButton = (errors.length > 0) ?
    <span className="errorButton">
      <FlatButton
        label={errorLabel}
        icon={<AlertError />}
        onTouchTap={(event: any) => props.onViewError(props.annotations, props.editor)} />
    </span>
    :
    <FlatButton
      label={(props.quest.published) ? 'Update' : 'Publish'}
      disabled={!questLoaded}
      onTouchTap={(event: any) => props.onMenuSelect('PUBLISH_QUEST', props.quest)} />;

  return (
    <span className="quest_app_bar">
      <AppBar
        title={questTitle}
        showMenuIconButton={false}
        iconElementRight={
          <div className="appBarRight">
            <span className="email">{props.user.email}</span>
            <IconMenu
              className="loginState"
              iconButtonElement={
                <IconButton><NavigationArrowDropDown /></IconButton>
              }
              targetOrigin={{horizontal: 'right', vertical: 'top'}}
              anchorOrigin={{horizontal: 'right', vertical: 'top'}}
            >
              <MenuItem primaryText={loginText} disabled={true}/>
              <MenuItem primaryText="Sign Out"
                onTouchTap={() => props.onUserDialogRequest(props.user)}
              />
            </IconMenu>
          </div>
        }
      />
      <Toolbar className="toolbar">
        <ToolbarGroup firstChild={true}>
          <FlatButton label="New" onTouchTap={(event: any) => props.onMenuSelect('NEW_QUEST', props.quest)} />
          {publishButton}
          {Boolean(props.quest.published) && <FlatButton label="Unpublish" onTouchTap={(event: any) => props.onMenuSelect('UNPUBLISH_QUEST', props.quest)} />}
          <FlatButton label="View in Drive" disabled={!questLoaded} onTouchTap={(event: any) => props.onMenuSelect('DRIVE_VIEW', props.quest)} />
          <FlatButton label="Help" onTouchTap={(event: any) => props.onMenuSelect('HELP', props.quest)} />
          {saveIndicator}
        </ToolbarGroup>
        <ToolbarGroup lastChild={true}>
          <FlatButton
            onTouchTap={(event: any) => props.playFromCursor({}, props.editor, props.quest)}
            label="Play from Cursor">
          </FlatButton>
          {props.editor.bottomPanel &&
          <FlatButton
            onTouchTap={(event: any) => props.playFromCursor(props.scope, props.editor, props.quest)}
            label="Play from Cursor (preserve context)">
          </FlatButton>
          }
        </ToolbarGroup>
      </Toolbar>
    </span>
  );
}

export default QuestAppBar;
