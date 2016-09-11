import * as React from 'react';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';
import {UserType} from '../reducers/StateTypes';

export interface QuestAppBarStateProps {
  user: UserType;
};

export interface QuestAppBarDispatchProps {
  onDrawerToggle: ()=>void;
  onUserDialogRequest: ()=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  var user_details: JSX.Element;
  if (props.user.profile.image) {
    user_details = (<Avatar src={props.user.profile.image} onTouchTap={props.onUserDialogRequest}/>);
  } else {
    user_details = (<Avatar icon={<PersonOutlineIcon />} onTouchTap={props.onUserDialogRequest}/>);
  }

  return (
    <AppBar
      title="Expedition Quest Editor"
      onLeftIconButtonTouchTap={props.onDrawerToggle}
      iconElementRight={user_details} />
  );
}

export default QuestAppBar;