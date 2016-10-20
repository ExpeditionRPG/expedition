import * as React from 'react'
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline'
import IconButton from 'material-ui/IconButton'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import {UserState} from '../reducers/StateTypes'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'


export interface QuestAppBarStateProps {
  user: UserState;
};

export interface QuestAppBarDispatchProps {
  onDrawerToggle: (user: UserState)=>void;
  onUserDialogRequest: (user: UserState)=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const loginText = 'Logged in as ' + props.user.displayName;
  return (
    <AppBar
      title="Expedition Quest Creator"
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
      } />
  );
}

export default QuestAppBar;