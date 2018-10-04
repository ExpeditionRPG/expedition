import {connect} from 'react-redux';
import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {toCard} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {AppStateWithHistory, CardName} from '../../reducers/StateTypes';
import Search, {DispatchProps, StateProps} from './Search';

const mapStateToProps = (state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps => {
  return {
    results: [], // Default in case search results are not defined
    ...state.search,
    settings: state.settings,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    toCard: (name: CardName) => {
      dispatch(toCard({name}));
    },
    onQuest: (quest: Quest) => {
      dispatch(previewQuest({quest}));
    },
  };
};

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Search);

export default SearchContainer;
