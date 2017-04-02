import Redux from 'redux'
import {connect} from 'react-redux'

import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'

import {toCard} from '../actions/card'
import {fetchQuestXML, search} from '../actions/web'
import {initial_state} from '../reducers/search'
import {AppState, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    players: state.settings.numPlayers,
    quests: [
// For dev testing only - comment out before deploys
      // {id: '-1', title: 'Test end quest', summary: 'DEV', publishedurl: 'quests/test_end_quest.xml'},
// Actual quests (id's generated from publishing, but don't leave them published!)
      {id: '0B7K9abSH1xEOeEZSVVMwNHNqaFE', title: 'Learning to Adventure', summary: 'Your first adventure.', publishedurl: 'quests/learning_to_adventure.xml'},
      {id: '0BzrQOdaJcH9MU3Z4YnE2Qi1oZGs', title: 'Oust Albanus', summary: 'Your party encounters a smelly situation.', publishedurl: 'quests/oust_albanus.xml'},
      {id: '0B7K9abSH1xEORjdkMWtTY3ZtNGs', title: 'Mistress Malaise', summary: 'Mystery, Misfortune, and a Mistress.', publishedurl: 'quests/mistress_malaise.xml'},
      {id: '0B7K9abSH1xEOUUR1Z0lncm9NRjQ', title: 'Dungeon Crawl', summary: 'How deep can you delve?', publishedurl: 'quests/dungeon_crawl.xml'},
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
        dispatch(search(players, user, initial_state.search));
      } else {
        dispatch(toCard('SEARCH_CARD', 'DISCLAIMER'));
      }
    },
    onQuestSelect(quest: QuestDetails): void {
      dispatch(fetchQuestXML(quest.id, quest.publishedurl));
    },
  };
}

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer
