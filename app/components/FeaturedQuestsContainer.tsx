import Redux from 'redux'
import {connect} from 'react-redux'

import {FEATURED_QUESTS} from '../Constants'
import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'
import {toCard} from '../actions/Card'
import {fetchQuestXML} from '../actions/Web'
import {search} from '../actions/Search'
import {initialSearch} from '../reducers/Search'
import {AppState, ExpansionsType, SettingsType, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    quests: FEATURED_QUESTS,
    settings: state.settings,
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeaturedQuestsDispatchProps => {
  return {
    onTools(): void {
      dispatch(toCard({name: 'ADVANCED'}));
    },
    onSearchSelect(user: UserState, settings: SettingsType): void {
      if (user && user.loggedIn) {
        dispatch(search({...initialSearch.search,
          players: settings.numPlayers,
          expansions: Object.keys(settings.contentSets).filter( key => settings.contentSets[key] ) as ExpansionsType[],
        }));
      } else {
        dispatch(toCard({name: 'SEARCH_CARD', phase: 'DISCLAIMER'}));
      }
    },
    onQuestSelect(quest: QuestDetails): void {
      dispatch(fetchQuestXML(quest));
    },
  };
}

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer
