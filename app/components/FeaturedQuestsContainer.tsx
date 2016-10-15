import { connect } from 'react-redux'
import {QuestDetails} from '../reducers/QuestTypes'
import {AppState} from '../reducers/StateTypes'
import {toCard} from '../actions/card'
import {loadQuestXML} from '../actions/web'
import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    quests: [
      {metaTitle: 'Oust Albanus', metaSummary: 'Your party encounters a smelly situation.', publishedUrl: 'quests/oust_albanus.xml'},
      {metaTitle: 'Mistress Malaise', metaSummary: 'Mystery, Misfortune, and a Mistress.', publishedUrl: 'quests/mistress_malaise.xml'},
    ]
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeaturedQuestsDispatchProps => {
  return {
    onQuestSelect(quest: QuestDetails): void {
      dispatch(loadQuestXML(quest.publishedUrl));
    },
    onAdvancedPlay(): void {
      dispatch(toCard('ADVANCED'));
    }
  };
}

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer