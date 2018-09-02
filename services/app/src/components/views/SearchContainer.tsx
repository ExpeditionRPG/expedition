import {connect} from 'react-redux';
import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {toCard, toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {search} from '../../actions/Search';
import {ensureLogin} from '../../actions/User';
import {subscribe} from '../../actions/Web';
import {AppStateWithHistory, SearchSettings, SettingsType, UserState} from '../../reducers/StateTypes';
import Search, {DispatchProps, StateProps} from './Search';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  const offlineQuests: {[id: string]: boolean} = {};
  for (const s of state.saved.list) {
    if (s.pathLen === 0) {
      offlineQuests[s.details.id] = true;
    }
  }

  return {
    isDirectLinked: state._history.length <= 1,
    results: [], // Default in case search results are not defined
    ...state.search,
    phase: ownProps.phase || 'SEARCH',
    settings: state.settings,
    user: state.user,
    questHistory: state.questHistory,
    offlineQuests,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onFilter: () => {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'SETTINGS'}));
    },
    onLoginRequest: (sub: boolean) => {
      dispatch(ensureLogin())
        .then((user: UserState) => {
          if (sub && user.email && user.email !== '') {
            dispatch(subscribe({email: user.email}));
          }
          return dispatch(toCard({name: 'SEARCH_CARD', phase: 'SETTINGS'}));
        });
    },
    onQuest: (quest: Quest) => {
      dispatch(previewQuest({quest}));
    },
    onReturn: () => {
      dispatch(toPrevious({}));
    },
    onSearch: (s: SearchSettings, settings: SettingsType) => {
      dispatch(search({search: s, settings}));
    },
  };
};

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer;
