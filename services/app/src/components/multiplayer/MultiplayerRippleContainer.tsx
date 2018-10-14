import {connect} from 'react-redux';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerRipple, {Props} from './MultiplayerRipple';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): Props => {
  return {
    ...ownProps,
    multiplayer: state.multiplayer,
  };
};

const MultiplayerRippleContainer = connect(mapStateToProps)(MultiplayerRipple);

export default MultiplayerRippleContainer;
