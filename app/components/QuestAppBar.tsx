import * as React from 'react';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import IconButton from 'material-ui/IconButton';
import HelpOutlineIcon from 'material-ui/svg-icons/action/help-outline';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import {UserState} from '../reducers/StateTypes';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';


export interface QuestAppBarStateProps {
  user: UserState;
};

export interface QuestAppBarDispatchProps {
  onDrawerToggle: (user: UserState)=>void;
  onUserDialogRequest: (user: UserState)=>void;
  onHelpRequest: ()=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  return (
    <AppBar
      title="Expedition Quest Creator"
      onLeftIconButtonTouchTap={() => props.onDrawerToggle(props.user)}
      iconElementRight={
        <IconMenu
          iconButtonElement={
            <IconButton><MoreVertIcon /></IconButton>
          }
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        >
          <MenuItem primaryText="Help" leftIcon={<HelpOutlineIcon/>} onTouchTap={props.onHelpRequest} />
          <MenuItem primaryText="Sign Out"
            leftIcon={
              <Avatar src={props.user.image} />
            }
            onTouchTap={() => props.onUserDialogRequest(props.user)}
          />
        </IconMenu>
      } />
  );
}

export default QuestAppBar;