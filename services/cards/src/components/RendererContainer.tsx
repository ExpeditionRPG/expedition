import {connect} from 'react-redux';
import {AppState} from '../reducers/StateTypes';
import Renderer, {RendererStateProps} from './Renderer';

const mapStateToProps = (state: AppState, ownProps: any): RendererStateProps => {
  return {
    cards: state.cards.filtered,
    filters: state.filters,
    translations: state.cards.translations,
  };
};

const RendererContainer = connect(
  mapStateToProps
)(Renderer);

export default RendererContainer;
