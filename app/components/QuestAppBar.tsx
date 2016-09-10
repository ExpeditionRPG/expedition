import React from 'react';
import PersonOutlineIcon from 'material-ui/svg-icons/social/person-outline';
import AppBar from 'material-ui/AppBar';
import Avatar from 'material-ui/Avatar';

const QuestAppBar = ({user_image, onDrawerToggle, onUserDialogRequest}: any): JSX.Element => {
  var user_details: JSX.Element;
  if (user_image) {
    user_details = (<Avatar src={user_image} onTouchTap={onUserDialogRequest}/>);
  } else {
    user_details = (<Avatar icon={<PersonOutlineIcon />} onTouchTap={onUserDialogRequest}/>);
  }

  return (
    <AppBar
      title="Expedition Quest Editor"
      onLeftIconButtonTouchTap={onDrawerToggle}
      iconElementRight={user_details} />
  );
}

export default QuestAppBar;