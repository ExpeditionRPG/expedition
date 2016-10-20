import * as React from 'react'
import Drawer from 'material-ui/Drawer'
import Menu from 'material-ui/Menu'
import Paper from 'material-ui/Paper'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import {List, ListItem, MakeSelectable} from 'material-ui/List'
import CircularProgress from 'material-ui/CircularProgress'
import FlatButton from 'material-ui/FlatButton'
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar'
import ModeEditIcon from 'material-ui/svg-icons/editor/mode-edit'
import HelpOutlineIcon from 'material-ui/svg-icons/action/help-outline'
import CloudDownloadIcon from 'material-ui/svg-icons/file/cloud-download'
import LockIcon from 'material-ui/svg-icons/action/lock'
import PublishIcon from 'material-ui/svg-icons/editor/publish'
import SaveIcon from 'material-ui/svg-icons/content/save'
import AddIcon from 'material-ui/svg-icons/content/add'
import DeleteIcon from 'material-ui/svg-icons/action/delete'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import Subheader from 'material-ui/Subheader'
import {QuestActionType} from '../actions/ActionTypes'
import {QuestType, DirtyState, DrawerState, UserState} from '../reducers/StateTypes'
import theme from '../theme'

var TimeAgo:any = require('timeago-react');

let SelectableList: any = MakeSelectable(List);

interface SelectableListProps extends React.Props<any> {
  onChange: any;
}

function wrapState(ComposedComponent: any) {
  return class SelectableList extends React.Component<SelectableListProps, {}> {
    handleRequestChange(event: any, index: string) {
      this.props.onChange(event, index);
    }

    render() {
      return (
        <ComposedComponent
          onChange={this.handleRequestChange.bind(this)}
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

SelectableList = wrapState(SelectableList);

const styles = {
  menuItem: {
    minHeight: 200
  },
  menuItemSummary: {
    fontStyle : "italic"
  },
  drawer: {
    width: 300
  },
  palette: {
    alternateTextColor: "#FFF",
    primary3Color: "black"
  }
}

export interface QuestDrawerStateProps {
  drawer: DrawerState
  quest: QuestType;
  dirty: DirtyState;
  user: UserState;
};

export interface QuestDrawerDispatchProps {
  onMenuSelect: (action: QuestActionType, dirty: boolean, quest: QuestType) => void;
  onDrawerRequestChange: () => void;
  onHelpRequest: ()=>void;
}

interface QuestDrawerProps extends QuestDrawerStateProps, QuestDrawerDispatchProps {}

const QuestDrawer = (props: QuestDrawerProps): JSX.Element => {
  var quest_list: JSX.Element;
  if (props.drawer.quests === null || props.drawer.quests === undefined) {
    quest_list = <CircularProgress />;
  } else if (props.drawer.quests.length === 0) {
    quest_list = <div>No saved quests.</div>
  } else {
    var menu: JSX.Element[] = [];
    for (var i = 0; i < props.drawer.quests.length; i++) {
      var quest = props.drawer.quests[i];

      // TODO: <!--<div><TimeAgo date={Date.parse(quest.modified)} /></div>-->
      menu.push(
        <ListItem
          key={i}
          value={quest.id}
          leftIcon={<ModeEditIcon/>}
          disabled={props.quest.id === quest.id}
          primaryText={quest.metaTitle || "Unnamed Quest"}
          secondaryTextLines={2}
          secondaryText={
            <div>
              <div>{quest.metaSummary}</div>
            </div>}
        />
      );
    }
    quest_list = (
      <div>
        <Subheader>{props.drawer.quests.length + " Saved Quest" + ((props.drawer.quests.length > 1) ? "s" : "")}</Subheader>
        <SelectableList defaultValue={props.quest.id} onChange={(event: any, id: string) => props.onMenuSelect('LOAD_QUEST', props.dirty, {id: id})}>
          {menu}
        </SelectableList>
      </div>
    );
  }

  // TODO: Sharing <MenuItem value="SHARE_SETTINGS" primaryText="Share" disabled={!props.quest.id} leftIcon={<LockIcon/>} />
  return (
    <Drawer docked={false} onRequestChange={props.onDrawerRequestChange} open={props.drawer.open} width={styles.drawer.width}>
      <Toolbar style={{backgroundColor: theme.palette.primary3Color}}>
        <ToolbarGroup>
          <ToolbarTitle style={{color: theme.palette.alternateTextColor}} text="Quest Options"/>
        </ToolbarGroup>
      </Toolbar>
      <Divider/>
      <Menu onChange={(event: any, action: QuestActionType) => props.onMenuSelect(action, props.dirty, props.quest)}>
        <MenuItem value="NEW_QUEST" primaryText="New" leftIcon={<AddIcon/>} />
        <MenuItem value="SAVE_QUEST" primaryText="Save" leftIcon={<SaveIcon/>} />
        <MenuItem value="PUBLISH_QUEST" primaryText="Publish" disabled={!props.quest.id} leftIcon={<PublishIcon/>} />
        <MenuItem value="DELETE_QUEST" primaryText="Delete" disabled={!props.quest.id} leftIcon={<DeleteIcon/>} />
        <MenuItem primaryText="Help" leftIcon={<HelpOutlineIcon/>} onTouchTap={props.onHelpRequest} />
      </Menu>
      <Divider/>
      {quest_list}
    </Drawer>
  )
}

export default QuestDrawer;
