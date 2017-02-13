import Redux from 'redux'
import {connect} from 'react-redux'

import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'

import {toCard} from '../actions/card'
import {fetchQuestXML, search} from '../actions/web'
import {AppState, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    players: state.settings.numPlayers,
    quests: [
      {title: 'Learning to Adventure', summary: 'Your first adventure.', publishedurl: 'quests/learning_to_adventure.xml'},
      {title: 'Mistress Malaise', summary: 'Mystery, Misfortune, and a Mistress.', publishedurl: 'quests/mistress_malaise.xml'},
      {title: 'Oust Albanus', summary: 'Your party encounters a smelly situation.', publishedurl: 'quests/oust_albanus.xml'},
    ],
    user: state.user,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeaturedQuestsDispatchProps => {
  return {
    onAdvancedPlay(): void {
      dispatch(toCard('ADVANCED'));
    },
    onSearchSelect(user: UserState, players: number): void {
      if (user && user.loggedIn) {
        dispatch(search(players, user, {text: null, age: 'inf', order: '-published', owner: 'anyone'}));
      } else {
        dispatch(toCard('SEARCH_CARD', 'DISCLAIMER'));
      }
    },
    onQuestSelect(quest: QuestDetails): void {
      dispatch(fetchQuestXML(quest.publishedurl));
    },
  };
}

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer
