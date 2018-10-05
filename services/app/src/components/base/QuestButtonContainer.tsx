import {connect} from 'react-redux';
import {AppState} from '../../reducers/StateTypes';
import QuestButton, {Props} from './QuestButton';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): Props => {
  const quest = ownProps.quest;
  if (!quest) {
    throw new Error('Could not render quest button with missing quest prop');
  }

  let isOffline = false;
  for (const s of state.saved.list) {
    if (s.pathLen === 0 && s.details.id === quest.id) {
      isOffline = true;
    }
  }

  let lastPlayed = null;
  const history = state.userQuests.history[quest.id];
  if (history && history.lastPlayed) {
    lastPlayed = history.lastPlayed;
  }

  const isPrivate = Boolean(state.userQuests.privateQuests[quest.id]);

  return {
    ...ownProps,
    quest,
    isOffline,
    isPrivate,
    lastPlayed,
    lastLogin: state.user.lastLogin,
  };
};

const QuestButtonContainer = connect(mapStateToProps)(QuestButton);

export default QuestButtonContainer;
