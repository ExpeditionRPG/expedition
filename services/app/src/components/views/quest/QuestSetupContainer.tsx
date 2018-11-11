import {toCard} from 'app/actions/Card';
import {numAdventurers, numPlayers} from 'app/actions/Settings';
import {AppState} from 'app/reducers/StateTypes';
import {connect} from 'react-redux';
import Redux from 'redux';
import QuestSetup, {DispatchProps, StateProps} from './QuestSetup';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    adventurers: numAdventurers(state.settings, state.multiplayer),
    players: numPlayers(state.settings, state.multiplayer),
    settings: state.settings,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onNext: () => {
      dispatch(toCard({name: 'QUEST_CARD'}));
    },
  };
};

const QuestSetupContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestSetup);

export default QuestSetupContainer;
