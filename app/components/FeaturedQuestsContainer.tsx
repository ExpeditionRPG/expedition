import { connect } from 'react-redux'
import {QuestDetails} from '../reducers/QuestTypes'
import {AppState} from '../reducers/StateTypes'
import {toCard} from '../actions/card'
import {fetchQuestXML} from '../actions/web'
import FeaturedQuests, {FeaturedQuestsStateProps, FeaturedQuestsDispatchProps} from './FeaturedQuests'

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    quests: [
      {title: 'Oust Albanus', summary: 'Your party encounters a smelly situation.', publishedurl: 'quests/oust_albanus.xml'},
      {title: 'Mistress Malaise', summary: 'Mystery, Misfortune, and a Mistress.', publishedurl: 'quests/mistress_malaise.xml'},
    ]
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeaturedQuestsDispatchProps => {
  return {
    onQuestSelect(quest: QuestDetails): void {
      dispatch(fetchQuestXML(quest.publishedurl));
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