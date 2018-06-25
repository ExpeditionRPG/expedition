import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard, toPrevious} from '../../actions/Card';
import {setDialog} from '../../actions/Dialog';
import {search, viewQuest} from '../../actions/Search';
import {ensureLogin} from '../../actions/User';
import {fetchQuestXML, subscribe} from '../../actions/Web';
import {QuestDetails} from '../../reducers/QuestTypes';
import {AppStateWithHistory, SearchSettings, SettingsType, UserState} from '../../reducers/StateTypes';
import Search, {SearchDispatchProps, SearchStateProps} from './Search';

const mapStateToProps = (state: AppStateWithHistory, ownProps: SearchStateProps): SearchStateProps => {
  return {
    isDirectLinked: state._history.length <= 1,
    results: [], // Default in case search results are not defined
    ...state.search,
    settings: state.settings,
    phase: ownProps.phase,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SearchDispatchProps => {
  return {
    onLoginRequest: (sub: boolean) => {
      dispatch(ensureLogin())
        .then((user: UserState) => {
          if (sub && user.email && user.email !== '') {
            dispatch(subscribe({email: user.email}));
          }
          return dispatch(toCard({name: 'SEARCH_CARD', phase: 'SETTINGS'}));
        });
    },
    onFilter: () => {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'SETTINGS'}));
    },
    onSearch: (s: SearchSettings, settings: SettingsType) => {
      dispatch(search({search: s, settings}));
    },
    onQuest: (quest: QuestDetails) => {
      dispatch(viewQuest({quest}));
    },
    onPlay: (quest: QuestDetails, isDirectLinked: boolean) => {
      if (isDirectLinked) {
        dispatch(setDialog('SET_PLAYER_COUNT'));
      } else {
        dispatch(fetchQuestXML(quest));
      }
    },
    onReturn: () => {
      dispatch(toPrevious({}));
    },
  };
};

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer;
