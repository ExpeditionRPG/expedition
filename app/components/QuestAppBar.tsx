import * as React from 'react'

import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'

import {grey900} from 'material-ui/styles/colors';

import {QuestType, UserState} from '../reducers/StateTypes'


const styles = {
  button: {
    marginLeft: 0,
    marginRight: 0,
  },
  toolbar: {
    background: grey900,
  },
};


export interface QuestAppBarStateProps {
  quest: QuestType;
  user: UserState;
};

export interface QuestAppBarDispatchProps {
  onDrawerToggle: (user: UserState)=>void;
  onHelpRequest: () => void;
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
        onLeftIconButtonTouchTap={() => props.onDrawerToggle(props.user)}
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
          <FlatButton style={styles.button} label="New" />
          <FlatButton style={styles.button} label="Publish" />
          <FlatButton style={styles.button} label="Unpublish" />
          <FlatButton style={styles.button} label="Open in Drive" />
          <FlatButton style={styles.button} label="Help" onTouchTap={props.onHelpRequest} />
          <FlatButton style={styles.button} label="All changes saved" disabled={true} />
        </ToolbarGroup>
      </Toolbar>
    </span>
  );
}

export default QuestAppBar;