import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {changeSettings} from '../../actions/Settings';
import {AppState} from '../../reducers/StateTypes';
import PartySizeSelect, {DispatchProps, StateProps} from './PartySizeSelect';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    numPlayers: state.settings.numPlayers,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
    onNext: () => {
      dispatch(changeSettings({multitouch: false}));
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
  };
};

const PartySizeSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PartySizeSelect);

export default PartySizeSelectContainer;
