import * as React from 'react';
import Drawer from 'material-ui/Drawer';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import {List, ListItem, MakeSelectable} from 'material-ui/List';
import CircularProgress from 'material-ui/CircularProgress';
import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import ModeEditIcon from 'material-ui/svg-icons/editor/mode-edit';
import AddIcon from 'material-ui/svg-icons/content/add';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import {NEW_QUEST, LOAD_QUEST, SAVE_QUEST, PUBLISH_QUEST, DELETE_QUEST, DOWNLOAD_QUEST, QuestActionType} from '../actions/ActionTypes';
import {QuestType, DirtyType, DrawerType, CodeViewType, UserType} from '../reducers/StateTypes'

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

export interface QuestListStateProps {
  drawer: DrawerType
  quest: QuestType;
  dirty: DirtyType;
  view: CodeViewType;
  user: UserType;
};

export interface QuestListDispatchProps {
  onMenuSelect: (action: QuestActionType, dirty: boolean, view: CodeViewType, quest: QuestType) => void;
  onDrawerRequestChange: () => void;
}

interface QuestListProps extends QuestListStateProps, QuestListDispatchProps {}

const QuestList = (props: QuestListProps): JSX.Element => {
  var body: JSX.Element;
  if (props.drawer.quests === null || props.drawer.quests === undefined) {
    body = <CircularProgress />;
  } else if (props.drawer.quests.length === 0) {
    body = <div>No saved quests.</div>
  } else {
    var menu: JSX.Element[] = [];
    for (var i = 0; i < props.drawer.quests.length; i++) {
      var quest = props.drawer.quests[i];
      menu.push(
        <ListItem
          key={i}
          value={quest.id}
          rightIcon={<ModeEditIcon/>}
          primaryText={quest.meta.title}
          secondaryText={quest.meta.summary}
        />
      );
    }
    body =
      <SelectableList onChange={(event: any, id: string) => props.onMenuSelect('LOAD_QUEST', props.dirty, props.view, {id: id})}>
        <Subheader>{props.drawer.quests.length + " Saved Quest" + ((props.drawer.quests.length > 1) ? "s" : "")}</Subheader>
        {menu}
      </SelectableList>;
  }

  let logged_in: boolean = Boolean(props.user.profile);

  // TODO add relatable icons
  return (
    <Drawer docked={false} onRequestChange={props.onDrawerRequestChange} open={props.drawer.open} width={styles.drawer.width}>
      <Toolbar style={{backgroundColor: styles.palette.primary3Color}}>
        <ToolbarGroup>
          <ToolbarTitle style={{color: styles.palette.alternateTextColor}} text="Options"/>
        </ToolbarGroup>
      </Toolbar>
      <Subheader>Edit</Subheader>
      <Menu onChange={(event: any, action: QuestActionType) => props.onMenuSelect(action, props.dirty, props.view, props.quest)}>
        <MenuItem value={NEW_QUEST} primaryText="New" />
        <MenuItem value={SAVE_QUEST} primaryText="Save" disabled={!logged_in} />
        <MenuItem value={PUBLISH_QUEST} primaryText="Publish" disabled={!logged_in} />
        <MenuItem value={DOWNLOAD_QUEST} primaryText="Download" disabled={!logged_in} />
        <MenuItem value={DELETE_QUEST} primaryText="Delete" disabled={!logged_in} />
      </Menu>
      <Divider/>
      {body}
    </Drawer>
  )
}

export default QuestList;