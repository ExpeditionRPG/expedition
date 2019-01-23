import {connect} from 'react-redux';
import Redux from 'redux';
import {MultiplayerEvent, MultiplayerEventBody} from 'shared/multiplayer/Events';
import {sendEvent, subscribeToEvents, unsubscribeFromEvents} from '../../actions/Multiplayer';
import {AppState} from '../../reducers/StateTypes';
import MultiplayerAffector, {DispatchProps, Props, StateProps} from './MultiplayerAffector';

const mapStateToProps = (state: AppState, ownProps: Partial<Props>): StateProps => {
  return {
    id: ownProps.id,
    abortOnScroll: ownProps.abortOnScroll,
    children: ownProps.children,
    className: ownProps.className,
    includeLocalInteractions: ownProps.includeLocalInteractions,
    onInteraction: ownProps.onInteraction,
    lazy: ownProps.lazy,
  };
};

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
  return {
    onEvent: (e: MultiplayerEventBody) => {
      dispatch(sendEvent(e));
    },
    onSubscribe: (handler: (e: MultiplayerEvent) => void) => {
      subscribeToEvents(handler);
    },
    onUnsubscribe: (handler: (e: MultiplayerEvent) => void) => {
      unsubscribeFromEvents(handler);
    },
  };
};

const MultiplayerAffectorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiplayerAffector);

export default MultiplayerAffectorContainer;
