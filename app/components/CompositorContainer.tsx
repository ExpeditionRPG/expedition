import Redux from 'redux'
import {connect} from 'react-redux'
import Compositor, {CompositorStateProps, CompositorDispatchProps} from './Compositor'
import {closeSnackbar} from '../actions/Snackbar'
import {AppStateWithHistory, TransitionClassType} from '../reducers/StateTypes'
import {getCardTemplateTheme} from './views/quest/cardtemplates/Template'

const mapStateToProps = (state: AppStateWithHistory, ownProps: CompositorStateProps): CompositorStateProps => {
  let transition: TransitionClassType = 'next';
  if (state === undefined || Object.keys(state).length === 0) {
    transition = 'instant';
  } else if (state.remotePlay && state.remotePlay.syncing) {
    transition = 'instant';
  } else if (state.card.name === 'SPLASH_CARD') {
    transition = 'instant';
  } else if (state._return) {
    transition = 'prev';
  }

  return {
    card: state.card,
    quest: state.quest,
    theme: getCardTemplateTheme(state.card),
    transition,
    settings: state.settings,
    snackbar: state.snackbar,
    remotePlay: state.remotePlay, // TODO rename to multiplayer
  };
}

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): CompositorDispatchProps => {
  return {
    closeSnackbar(): void {
      dispatch(closeSnackbar());
    },
  };
}

const CompositorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Compositor);

export default CompositorContainer
