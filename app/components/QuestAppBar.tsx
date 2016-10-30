import * as React from 'react'
import IconButton from 'material-ui/IconButton'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import {QuestType, UserState} from '../reducers/StateTypes'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'


export interface QuestAppBarStateProps {
  quest: QuestType;
  user: UserState;
};

export interface QuestAppBarDispatchProps {
  onDrawerToggle: (user: UserState)=>void;
  onUserDialogRequest: (user: UserState)=>void;
}

interface QuestAppBarProps extends QuestAppBarStateProps, QuestAppBarDispatchProps {}

const QuestAppBar = (props: QuestAppBarProps): JSX.Element => {
  const loginText = 'Logged in as ' + props.user.displayName;
  const questTitle = props.quest.title || 'unsaved quest';
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
    </span>
  );
}

export default QuestAppBar;