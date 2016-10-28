import * as React from 'react'

import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'

import {grey900} from 'material-ui/styles/colors'

import {QuestActionType} from '../actions/ActionTypes'
import {QuestType, DirtyState, UserState} from '../reducers/StateTypes'


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
  dirty: DirtyState;
  user: UserState;
  quest: QuestType;
};

export interface QuestAppBarDispatchProps {
  onMenuSelect: (action: QuestActionType, dirty: boolean, quest: QuestType) => void;
  onUserDialogRequest: (user: UserState)=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = props.quest.metaTitle || 'unsaved quest';
  return (
    <span style={{width: "100%", height: "100%"}}>
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
      <Toolbar style={styles.toolbar}>
        <ToolbarGroup firstChild={true}>
          <FlatButton style={styles.button} label="New" onTouchTap={(event: any) => props.onMenuSelect('NEW_QUEST', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label="Save" onTouchTap={(event: any) => props.onMenuSelect('SAVE_QUEST', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label="Publish" onTouchTap={(event: any) => props.onMenuSelect('PUBLISH_QUEST', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label="Unpublish" onTouchTap={(event: any) => props.onMenuSelect('UNPUBLISH_QUEST', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label="View in Drive" onTouchTap={(event: any) => props.onMenuSelect('DRIVE_VIEW', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label="Send Feedback" onTouchTap={(event: any) => props.onMenuSelect('FEEDBACK', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label="Help" onTouchTap={(event: any) => props.onMenuSelect('HELP', props.dirty, props.quest)} />
          <FlatButton style={styles.button} label=" " disabled={true} />
        </ToolbarGroup>
      </Toolbar>
    </span>
  );
}

export default QuestAppBar;