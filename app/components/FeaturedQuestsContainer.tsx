import { connect } from 'react-redux'
import {QuestDetails} from '../reducers/QuestTypes'
import {AppState} from '../reducers/StateTypes'
import {toCard} from '../actions/card'
import {loadQuestXML} from '../actions/web'
import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    quests: [
      {meta_title: 'Oust Albanus', meta_summary: 'Your party encounters a smelly situation.', url: 'quests/oust_albanus.xml'},
      {meta_title: 'Mistress Malaise', meta_summary: 'Mystery, Misfortune, and a Mistress.', url: 'quests/mistress_malaise.xml'},
    ]
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeaturedQuestsDispatchProps => {
  return {
    onQuestSelect(quest: QuestDetails): void {
      dispatch(loadQuestXML(quest.url));
    },
    onAdvancedPlay(): void {
      dispatch(toCard('SEARCH_CARD'));
    }
  };
}

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer