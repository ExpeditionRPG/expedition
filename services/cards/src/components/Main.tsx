import * as React from 'react';
import RendererContainer from './RendererContainer';
import TopBarContainer from './TopBarContainer';

export interface MainStateProps {
  loading: boolean;
}

class Main extends React.Component<MainStateProps, {}> {
  public render() {
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
