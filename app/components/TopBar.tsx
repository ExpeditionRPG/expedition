import * as React from 'react'

import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar'

import AlertError from 'material-ui/svg-icons/alert/error'
import NavigationArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down'
import SyncIcon from 'material-ui/svg-icons/notification/sync'

import {UserState} from '../reducers/StateTypes'

//TODO INCLUDE VERSION

export interface TopBarStateProps {
  user: UserState;
};

export interface TopBarDispatchProps {
  onUserDialogRequest: (user: UserState)=>void;
}

interface TopBarProps extends TopBarStateProps, TopBarDispatchProps {}

const TopBar = (props: TopBarProps): JSX.Element => {
  const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = 'TITLE HERE';

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
          <FlatButton label="Help" onTouchTap={(event: any) => {console.log('TODO');}}/>
        </ToolbarGroup>
      </Toolbar>
    </span>
  );
}

export default TopBar;
