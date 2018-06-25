import Redux from 'redux'
import {connect} from 'react-redux'
import {AppState} from '../../reducers/StateTypes'
import {changeSettings} from '../../actions/Settings'
import {toCard} from '../../actions/Card'
import PartySizeSelect, {PartySizeSelectStateProps, PartySizeSelectDispatchProps} from './PartySizeSelect'

const mapStateToProps = (state: AppState, ownProps: PartySizeSelectStateProps): PartySizeSelectStateProps => {
  return {
    numPlayers: state.settings.numPlayers,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): PartySizeSelectDispatchProps => {
  return {
    onNext: () => {
      dispatch(changeSettings({multitouch: false}));
      dispatch(toCard({name: 'FEATURED_QUESTS'}));
    },
    onDelta: (numPlayers: number, delta: number) => {
      numPlayers += delta;
      if (numPlayers <= 0 || numPlayers > 6) {
        return;
      }
      dispatch(changeSettings({numPlayers}));
    },
  };
}

const PartySizeSelectContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PartySizeSelect);

export default PartySizeSelectContainer
