import {connect} from 'react-redux';
import Redux from 'redux';
import {toPrevious} from '../../actions/Card';
import {AppState, CardName} from '../../reducers/StateTypes';
import CheckoutDone, {DispatchProps, StateProps} from './CheckoutDone';
import {ParserNode} from './quest/cardtemplates/TemplateTypes';

const mapStateToProps = (state: AppState): StateProps => {
  return {
    checkout: state.checkout,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onHome: (): void => {
      dispatch(toPrevious({matchFn: (c: CardName, n: ParserNode) => c === 'TUTORIAL_QUESTS'}));
    },
  };
};

const CheckoutDoneContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CheckoutDone);

export default CheckoutDoneContainer;
