import {connect} from 'react-redux';
import Redux from 'redux';
import {toCard} from '../../actions/Card';
import {changeSettings} from '../../actions/Settings';
import {AppState} from '../../reducers/StateTypes';
import PartySizeSelect, {PartySizeSelectDispatchProps, PartySizeSelectStateProps} from './PartySizeSelect';

const mapStateToProps = (state: AppState, ownProps: PartySizeSelectStateProps): PartySizeSelectStateProps => {
  return {
    numPlayers: state.settings.numPlayers,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): PartySizeSelectDispatchProps => {
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
