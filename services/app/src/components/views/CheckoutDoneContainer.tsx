import {connect} from 'react-redux';
import Redux from 'redux';
import {toPrevious} from '../../actions/Card';
import {AppState} from '../../reducers/StateTypes';
import CheckoutDone, {DispatchProps, StateProps} from './CheckoutDone';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    checkout: state.checkout,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onHome: (): void => {
      dispatch(toPrevious({name: 'TUTORIAL_QUESTS'}));
    },
  };
};

const CheckoutDoneContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckoutDone);

export default CheckoutDoneContainer;
