import * as React from 'react'
import AppBarContainer from './AppBarContainer'
import RendererContainer from './RendererContainer'

export interface MainStateProps {
  loading: boolean;
}

export interface MainDispatchProps {
  downloadCards: () => void;
}

export interface MainProps extends MainStateProps, MainDispatchProps {};

class Main extends React.Component<MainProps, {}> {
  componentDidMount() {
    this.props.downloadCards();
  }

  render() {
    return (
      <div>
        <AppBarContainer/>
        {this.props.loading && <div className="sk-circle" id="loading">
          <div className="sk-circle1 sk-child"></div>
          <div className="sk-circle2 sk-child"></div>
          <div className="sk-circle3 sk-child"></div>
          <div className="sk-circle4 sk-child"></div>
          <div className="sk-circle5 sk-child"></div>
          <div className="sk-circle6 sk-child"></div>
          <div className="sk-circle7 sk-child"></div>
          <div className="sk-circle8 sk-child"></div>
          <div className="sk-circle9 sk-child"></div>
          <div className="sk-circle10 sk-child"></div>
          <div className="sk-circle11 sk-child"></div>
          <div className="sk-circle12 sk-child"></div>
        </div>}
        <RendererContainer/>
      </div>
    );
  }
}

export default Main;
