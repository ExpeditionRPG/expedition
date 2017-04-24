import Redux from 'redux'
import {connect} from 'react-redux'
import Renderer, {RendererStateProps, RendererDispatchProps} from './Renderer'

const mapStateToProps = (state: any, ownProps: any): RendererStateProps => {
  return {
    cards: state.cards.filtered,
    renderSettings: state.renderSettings,
  };
}

const mapDispatchToProps = (dispatch: Redux.Dispatch<any>, ownProps: any): RendererDispatchProps => {
  return {};
}

const RendererContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Renderer);

export default RendererContainer;
