import {connect} from 'react-redux'
import {AppState, SearchSettings, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {toPrevious, toCard} from '../actions/card'
import {viewQuest} from '../actions/quest'
import {fetchQuestXML, search} from '../actions/web'
import Search, {SearchStateProps, SearchDispatchProps} from './Search'
import {login} from '../actions/user'

const mapStateToProps = (state: AppState, ownProps: SearchStateProps): SearchStateProps => {
  return Object.assign({}, state.search, {phase: ownProps.phase, user: state.user, numPlayers: state.settings.numPlayers});
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): SearchDispatchProps => {
  return {
    onLoginRequest: () => {
      dispatch(login(()=> {
        dispatch(toCard('SEARCH_CARD', 'SETTINGS'));
      }));
    },
    onSearch: (numPlayers: number, user: UserState, request: SearchSettings) => {
      dispatch(search(numPlayers, user, request));
    },
    onQuest: (quest: QuestDetails) => {
      dispatch(viewQuest(quest));
      dispatch(toCard('SEARCH_CARD', 'DETAILS'));
    },
    onPlay: (quest: QuestDetails) => {
      dispatch(fetchQuestXML(quest.publishedurl));
    },
    onOwnedChange: (checked: boolean) => {
      console.log("TODO");
    }
  };
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer
