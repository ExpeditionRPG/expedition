import {connect} from 'react-redux';
import Redux from 'redux';
import {closeSnackbar} from '../actions/Snackbar';
import {AppStateWithHistory, TransitionClassType} from '../reducers/StateTypes';
import Compositor, {CompositorDispatchProps, CompositorStateProps} from './Compositor';
import {getCardTemplateTheme} from './views/quest/cardtemplates/Template';

const mapStateToProps = (state: AppStateWithHistory, ownProps: CompositorStateProps): CompositorStateProps => {
  let transition: TransitionClassType = 'next';
  if (state === undefined || Object.keys(state).length === 0) {
    transition = 'instant';
  } else if (state.multiplayer && state.multiplayer.syncing) {
    transition = 'instant';
  } else if (state.card.name === 'SPLASH_CARD') {
    transition = 'instant';
  } else if (state._return) {
    transition = 'prev';
  }

  return {
    card: state.card,
    multiplayer: state.multiplayer, // TODO rename to multiplayer
    quest: state.quest,
    settings: state.settings,
    snackbar: state.snackbar,
    theme: getCardTemplateTheme(state.card),
    transition,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CompositorDispatchProps => {
  return {
    closeSnackbar(): void {
      dispatch(closeSnackbar());
    },
  };
};

const CompositorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Compositor);

export default CompositorContainer;
