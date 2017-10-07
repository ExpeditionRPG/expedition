import Redux from 'redux'
import {connect} from 'react-redux'

import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'

import {toCard} from '../actions/Card'
import {fetchQuestXML} from '../actions/Web'
import {search} from '../actions/Search'
import {initialSearch} from '../reducers/Search'
import {AppState, ExpansionsType, SettingsType, UserState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  const quests = [ // Featured quests (id's generated from publishing, but don't leave them published!)
    {id: '0B7K9abSH1xEOeEZSVVMwNHNqaFE', title: 'Learning to Adventure', summary: 'Your first adventure.', author: 'Todd Medema', publishedurl: 'quests/learning_to_adventure.xml'},
    {id: '0B7K9abSH1xEOWVpEV1JGWDFtWmc', title: 'Learning 2: The Horror', summary: 'Your first adventure continues with Expedition: The Horror.', author: 'Todd Medema', publishedurl: 'quests/learning_to_adventure_2_the_horror.xml', expansionhorror: true },
    {id: '0BzrQOdaJcH9MU3Z4YnE2Qi1oZGs', title: 'Oust Albanus', summary: 'Your party encounters a smelly situation.', author: 'Scott Martin', publishedurl: 'quests/oust_albanus.xml'},
    {id: '0B7K9abSH1xEORjdkMWtTY3ZtNGs', title: 'Mistress Malaise', summary: 'Mystery, Misfortune, and a Mistress.', author: 'Scott Martin', publishedurl: 'quests/mistress_malaise.xml'},
    {id: '0B7K9abSH1xEOUUR1Z0lncm9NRjQ', title: 'Dungeon Crawl', summary: 'How deep can you delve?', author: 'Todd Medema', publishedurl: 'quests/dungeon_crawl.xml'},
  ];
  if (process.env.NODE_ENV === 'dev') { // Dev test quest
    // http://quests.expeditiongame.com/#0B7K9abSH1xEOV3M2bTVMdWc4NVk
    quests.unshift({id: '1', title: 'Test quest', summary: 'DEV', author: 'DEV', publishedurl: 'quests/test_quest.xml'});
  }
  return {
    quests,
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
