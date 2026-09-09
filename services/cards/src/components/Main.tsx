import * as React from 'react';
import RendererContainer from './RendererContainer';
import TopBarContainer from './TopBarContainer';

export interface StateProps {
  loading: boolean;
  error?: string;
}

class Main extends React.Component<StateProps, {}> {
  public render() {
    const loadingCircles = [];
    for (let i = 0; i < 12; i++) {
      loadingCircles.push(
        <div key={i} className={`sk-circle${i} sk-child`}></div>,
      );
    }
    return (
      <div>
        <TopBarContainer />
        {this.props.error && (
          <p role="alert">
            Could not load cards: {this.props.error}. Use Reload card data to
            try again.
          </p>
        )}
        {this.props.loading && (
          <div className="sk-circle" id="loading">
            {loadingCircles}
          </div>
        )}
        <RendererContainer />
      </div>
    );
  }
}

export default Main;
