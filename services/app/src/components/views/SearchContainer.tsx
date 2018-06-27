import Redux from 'redux'
import {connect} from 'react-redux'
import Search, {SearchStateProps, SearchDispatchProps} from './Search'
import {toPrevious, toCard} from '../../actions/Card'
import {setDialog} from '../../actions/Dialog'
import {ensureLogin} from '../../actions/User'
import {fetchQuestXML, subscribe} from '../../actions/Web'
import {search, viewQuest} from '../../actions/Search'
import {AppStateWithHistory, SearchSettings, SettingsType, UserState} from '../../reducers/StateTypes'
import {QuestDetails} from '../../reducers/QuestTypes'


const mapStateToProps = (state: AppStateWithHistory, ownProps: SearchStateProps): SearchStateProps => {
  return {
    isDirectLinked: state._history.length <= 1,
    results: [], // Default in case search results are not defined
    ...state.search,
    settings: state.settings,
    phase: ownProps.phase,
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SearchDispatchProps => {
  return {
    onLoginRequest: (sub: boolean) => {
      dispatch(ensureLogin())
        .then((user: UserState)=> {
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
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer
