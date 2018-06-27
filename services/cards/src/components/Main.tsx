import * as React from 'react'
import TopBarContainer from './TopBarContainer'
import RendererContainer from './RendererContainer'

export interface MainStateProps {
  loading: boolean;
}

export interface MainDispatchProps {
}

export interface MainProps extends MainStateProps, MainDispatchProps {};

class Main extends React.Component<MainProps, {}> {
  render() {
    const loadingCircles = [];
    for (let i = 0; i < 12; i++) {
      loadingCircles.push(<div key={i} className={`sk-circle${i} sk-child`}></div>);
    }
    return (
      <div>
        <TopBarContainer/>
        {this.props.loading && <div className="sk-circle" id="loading">
          {loadingCircles}
        </div>}
        <RendererContainer/>
      </div>
    );
  }
}

export default Main;
