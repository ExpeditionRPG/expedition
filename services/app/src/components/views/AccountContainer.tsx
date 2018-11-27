import {connect} from 'react-redux';
import Redux from 'redux';
import {Quest} from 'shared/schema/Quests';
import {toPrevious} from '../../actions/Card';
import {previewQuest} from '../../actions/Quest';
import {getUserFeedBacks, logoutUser} from '../../actions/User';
import {NAV_CARDS} from '../../Constants';
import {AppState, CardName} from '../../reducers/StateTypes';
import Account, {IDispatchProps, IStateProps} from './Account';

const mapStateToProps = (state: AppState): IStateProps => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): IDispatchProps =>  ({
  logoutUser: () => dispatch(logoutUser()),
  getUserFeedBacks: () => dispatch(getUserFeedBacks()),
  onReturn: () => {
    dispatch(toPrevious({
      skip: NAV_CARDS.map((c) => ({name: c as CardName})),
    }));
  },
  onQuestSelect(quest: Quest): void {
    dispatch(previewQuest({quest}));
  },
});

const AccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Account);

export default AccountContainer;
