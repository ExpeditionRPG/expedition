import * as React from 'react'

import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'

import {grey900} from 'material-ui/styles/colors'
import AlertError from 'material-ui/svg-icons/alert/error'

import {QuestActionType} from '../actions/ActionTypes'
import {AnnotationType, QuestType, UserState, EditorState, ValidState} from '../reducers/StateTypes'


const styles = {
  appbar: {
    height: '54px',
    marginTop: '-6px',
  },
  button: {
    margin: '4px 0',
    minWidth: '60px',
  },
  toolbar: {
    background: grey900,
    height: '44px',
  },
};


export interface QuestAppBarStateProps {
  annotations: AnnotationType[];
  quest: QuestType;
  editor: EditorState;
  user: UserState;
};

export interface QuestAppBarDispatchProps {
  onMenuSelect: (action: QuestActionType, quest: QuestType) => void;
  onUserDialogRequest: (user: UserState)=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = props.quest.title || 'unsaved quest';
  const savingText = (props.editor.dirty) ? 'Unsaved changes' : 'All changes saved';
  const errors = props.annotations.filter((annotation) => { return annotation.type === 'error' });
  const errorLabel = (errors.length > 1) ? 'Validation Errors' : 'Validation Error';
  const publishButton = (errors.length > 0) ?
    <FlatButton
      style={styles.button}
      label={errorLabel}
      icon={<AlertError />}
      onTouchTap={(event: any) => props.onMenuSelect('PUBLISH_QUEST', props.quest)} />
    :
    <FlatButton
      style={styles.button}
      label="Publish"
      onTouchTap={(event: any) => props.onMenuSelect('PUBLISH_QUEST', props.quest)} />;

  return (
    <span className="quest_app_bar">
      <AppBar
        title={questTitle}
        showMenuIconButton={false}
        style={styles.appbar}
        iconElementRight={
          <IconMenu
            iconButtonElement={
              <IconButton iconStyle={{'width': '24px', 'height': '24px' }}><Avatar src={props.user.image}/></IconButton>
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
          <FlatButton label="View in Drive" onTouchTap={(event: any) => props.onMenuSelect('DRIVE_VIEW', props.quest)} />
          <FlatButton label="Send Feedback" onTouchTap={(event: any) => props.onMenuSelect('FEEDBACK', props.quest)} />
          <FlatButton label="Help" onTouchTap={(event: any) => props.onMenuSelect('HELP', props.quest)} />
          <FlatButton label={savingText} disabled={true} />
        </ToolbarGroup>
      </Toolbar>
    </span>
  );
}

export default QuestAppBar;
