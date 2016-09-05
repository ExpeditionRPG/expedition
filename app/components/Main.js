import React from 'react';
import FileFolder from 'material-ui/svg-icons/file/folder';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { Provider } from 'react-redux';

// Custom components
import QuestAppBarContainer from './QuestAppBarContainer';
import QuestListContainer from './QuestListContainer';
import QuestIDEContainer from './QuestIDEContainer';
import DialogsContainer from './DialogsContainer';
import {UserDialog, ConfirmNewQuestDialog, PublishQuestDialog, ConfirmLoadQuestDialog} from './Dialogs';

import { createStore } from 'redux'
import questIDEApp from './reducers'

// Initialize the global redux store
let auth = JSON.parse(document.getElementById("initial-state").textContent);
let store = createStore(questIDEApp, {
  user: {
    profile: auth.profile,
    login: auth.login,
    logout: auth.logout
  }
}, window.devToolsExtension && window.devToolsExtension()); //, DevTools.instrument());

if (module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(require('./reducers')/*.default if you use Babel 6+ */)
  );
}

const styles = {
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column"
  }
};

var QUEST_SPEC_URL = "https://github.com/Fabricate-IO/expedition-quest-ide/blob/master/translation/quest_spec.md";

export default class QuestIDE extends React.Component {
  // TODO: Add graph and adventurer views
  render() {
    return (<Provider store={store}>
      <div style={{width: "100%", height: "100%"}}>
        <QuestAppBarContainer />
        <QuestIDEContainer />
        <QuestListContainer />
        <DialogsContainer />
      </div>
    </Provider>);
  }
}

export default QuestIDE;