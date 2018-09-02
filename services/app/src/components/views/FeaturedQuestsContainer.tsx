import {connect} from 'react-redux';
import Redux from 'redux';

import {Quest} from 'shared/schema/Quests';
import {toCard} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {search} from '../../actions/Search';
import {FEATURED_QUESTS} from '../../Constants';
import {initialSearch} from '../../reducers/Search';
import {AppState, CardName, SettingsType, UserState} from '../../reducers/StateTypes';
import FeaturedQuests, {DispatchProps, StateProps} from './FeaturedQuests';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    quests: FEATURED_QUESTS,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
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
    onQuestSelect(quest: Quest): void {
      dispatch(previewQuest({quest}));
    },
  };
};

const FeaturedQuestsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturedQuests);

export default FeaturedQuestsContainer;
