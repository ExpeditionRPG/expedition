import * as React from 'react';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import IconButton from 'material-ui/IconButton';
import HelpOutlineIcon from 'material-ui/svg-icons/action/help-outline';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import {UserType} from '../reducers/StateTypes';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';


export interface QuestAppBarStateProps {
  user: UserType;
};

export interface QuestAppBarDispatchProps {
  onDrawerToggle: ()=>void;
  onUserDialogRequest: (user: UserType)=>void;
  onHelpRequest: ()=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  var user_item: JSX.Element;
  if (props.user && props.user.image) {
    user_item = (
      <MenuItem primaryText="Sign Out" leftIcon={
        <Avatar src={props.user.image} />
      } onTouchTap={() => props.onUserDialogRequest(props.user)} />
    );
  } else {
    user_item = (
      <MenuItem primaryText="Sign In" leftIcon={
        <PersonOutlineIcon />
      } onTouchTap={() => props.onUserDialogRequest(props.user)} />);
  }

  return (
    <AppBar
      title="Expedition Quest Editor"
      onLeftIconButtonTouchTap={props.onDrawerToggle}
      iconElementRight={
        <IconMenu
          iconButtonElement={
            <IconButton><MoreVertIcon /></IconButton>
          }
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        >
          <MenuItem primaryText="Help" leftIcon={<HelpOutlineIcon/>} onTouchTap={props.onHelpRequest} />
          {user_item}
        </IconMenu>
      } />
  );
}

export default QuestAppBar;