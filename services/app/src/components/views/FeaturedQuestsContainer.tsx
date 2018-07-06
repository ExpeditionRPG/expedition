import {connect} from 'react-redux';
import Redux from 'redux';

import {toCard} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {search} from '../../actions/Search';
import {FEATURED_QUESTS} from '../../Constants';
import {QuestDetails} from '../../reducers/QuestTypes';
import {initialSearch} from '../../reducers/Search';
import {AppState, CardName, SettingsType, UserState} from '../../reducers/StateTypes';
import FeaturedQuests, {FeaturedQuestsDispatchProps, FeaturedQuestsStateProps} from './FeaturedQuests';

const mapStateToProps = (state: AppState, ownProps: FeaturedQuestsStateProps): FeaturedQuestsStateProps => {
  return {
    quests: FEATURED_QUESTS,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): FeaturedQuestsDispatchProps => {
  return {
    toCard(name: CardName): void {
      dispatch(toCard({name}));
    },
    onSearchSelect(user: UserState, settings: SettingsType): void {
      if (user && user.loggedIn) {
        dispatch(search({
          search: initialSearch.search,
          settings,
        }));
      } else {
        dispatch(toCard({name: 'SEARCH_CARD', phase: 'DISCLAIMER'}));
      }
    },
    onQuestSelect(quest: QuestDetails): void {
      dispatch(previewQuest({quest}));
    },
  };
};

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer;
