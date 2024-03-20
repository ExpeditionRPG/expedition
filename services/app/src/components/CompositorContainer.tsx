import {connect} from 'react-redux';
import Redux from 'redux';
import {closeSnackbar} from '../actions/Snackbar';
import {TransitionType} from '../Constants';
import {AppStateWithHistory} from '../reducers/StateTypes';
import Compositor, {DispatchProps, isNavCard, StateProps} from './Compositor';
import {getCardTemplateTheme} from './views/quest/cardtemplates/Template';

const mapStateToProps = (state: AppStateWithHistory): StateProps => {
  let transition: TransitionType = TransitionType.next;
  if (state === undefined || Object.keys(state).length === 0) {
    transition = TransitionType.instant;
  } else if (state.card.name === 'SPLASH_CARD') {
    transition = TransitionType.instant;
  } else if (state._transition !== null) {
    transition = state._transition;
  } else if (isNavCard(state.card.name)) {
    transition = TransitionType.nav;
  }
  console.log(transition);

  return {
    card: state.card,
    multiplayer: state.multiplayer, // TODO rename to multiplayer
    quest: state.quest,
    settings: state.settings,
    snackbar: state.snackbar,
    theme: getCardTemplateTheme(state.quest.node),
    transition,
  };
};

export const mapDispatchToProps = (dispatch: Redux.Dispatch<any>): DispatchProps => {
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
