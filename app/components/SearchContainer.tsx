import Redux from 'redux'
import {connect} from 'react-redux'

import Search, {SearchStateProps, SearchDispatchProps} from './Search'

import {toPrevious, toCard} from '../actions/Card'
import {changeSettings} from '../actions/Settings'
import {login} from '../actions/User'
import {fetchQuestXML, subscribe} from '../actions/Web'
import {search, viewQuest} from '../actions/Search'
import {AppState, SearchSettings, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'


const mapStateToProps = (state: AppState, ownProps: SearchStateProps): SearchStateProps => {
  return {
    ...state.search,
    numPlayers: state.settings.numPlayers,
    phase: ownProps.phase,
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SearchDispatchProps => {
  return {
    onLoginRequest: (sub: boolean) => {
      dispatch(login({callback: (user: UserState)=> {
        if (sub && user.email && user.email !== '') {
          dispatch(subscribe({email: user.email}));
        }
        dispatch(toCard({name: 'SEARCH_CARD', phase: 'SETTINGS'}));
      }}));
    },
    onFilter: () => {
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'SETTINGS'}));
    },
    onSearch: (numPlayers: number, user: UserState, request: SearchSettings) => {
      dispatch(search({players: numPlayers, ...request}));
    },
    onQuest: (quest: QuestDetails) => {
      dispatch(viewQuest({quest}));
      dispatch(toCard({name: 'SEARCH_CARD', phase: 'DETAILS'}));
    },
    onPlay: (quest: QuestDetails) => {
      dispatch(fetchQuestXML(quest));
    },
  };
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer
