import Redux from 'redux'
import {connect} from 'react-redux'
import Renderer, {RendererStateProps} from './Renderer'
import {AppState} from '../reducers/StateTypes'

const mapStateToProps = (state: AppState, ownProps: any): RendererStateProps => {
  return {
    cards: state.cards.filtered,
    filters: state.filters,
    translations: state.cards.translations,
  };
}

const RendererContainer = connect(
  mapStateToProps
)(Renderer);

export default RendererContainer;
