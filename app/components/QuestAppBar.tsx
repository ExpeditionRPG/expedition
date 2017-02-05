import * as React from 'react'

import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'

import AlertError from 'material-ui/svg-icons/alert/error'
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
  playFromCursor: (baseScope: any, editor: EditorState, quest: QuestType) => void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const questLoaded = (props.quest.id != null);
  const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = props.quest.title || 'unsaved quest';

  let savingText = 'Saving...';
  let savingIcon = <SyncIcon />;
  if (props.editor.dirtyTimeout != null) {
    // saving - default (overrides other cases)
  } else if (props.quest.saveError) {
    savingText = 'Error: unable to save';
    savingIcon = <AlertError />;
  } else if (!props.editor.dirty) {
    savingText = 'All changes saved';
    savingIcon = null;
  }
  const errors = props.annotations.filter((annotation) => { return annotation.type === 'error' });
  const errorLabel = (errors.length > 1) ? 'Validation Errors' : 'Validation Error';
  const publishButton = (errors.length > 0) ?
    <span className="errorButton"><FlatButton
      label={errorLabel}
      icon={<AlertError />}
      disabled={true} /></span>
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
          <IconMenu
            className="loginState"
            iconButtonElement={
              <IconButton><Avatar src={props.user.image}/></IconButton>
            }
            targetOrigin={{horizontal: 'right', vertical: 'top'}}
            anchorOrigin={{horizontal: 'right', vertical: 'top'}}
          >
            <MenuItem primaryText={loginText} disabled={true}/>
            <MenuItem primaryText="Sign Out"
              onTouchTap={() => props.onUserDialogRequest(props.user)}
            />
          </IconMenu>
        }
      />
      <Toolbar className="toolbar">
        <ToolbarGroup firstChild={true}>
          <FlatButton label="New" onTouchTap={(event: any) => props.onMenuSelect('NEW_QUEST', props.quest)} />
          {publishButton}
          {Boolean(props.quest.published) && <FlatButton label="Unpublish" onTouchTap={(event: any) => props.onMenuSelect('UNPUBLISH_QUEST', props.quest)} />}
          <FlatButton label="View in Drive" disabled={!questLoaded} onTouchTap={(event: any) => props.onMenuSelect('DRIVE_VIEW', props.quest)} />
          <FlatButton label="Send Feedback" onTouchTap={(event: any) => props.onMenuSelect('FEEDBACK', props.quest)} />
          <FlatButton label="Help" onTouchTap={(event: any) => props.onMenuSelect('HELP', props.quest)} />
          <span className="savingText"><FlatButton label={savingText} icon={savingIcon} disabled={true} /></span>
        </ToolbarGroup>
        <ToolbarGroup>
          <FlatButton
            onTouchTap={(event: any) => props.playFromCursor({}, props.editor, props.quest)}
            label="Play from Cursor">
          </FlatButton>
          {props.editor.bottomPanelShown && 
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
