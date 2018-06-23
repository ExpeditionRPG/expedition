import * as React from 'react'
import {Provider} from 'react-redux'
import CompositorContainer from 'app/components/CompositorContainer'
import {getStore as getAppStore} from 'app/Store'

export interface AppStateProps {
}

export interface AppDispatchProps {
}

interface AppProps extends AppStateProps, AppDispatchProps {}

const App = (props: AppProps): JSX.Element => {
  return (
    <div className="app_root">
      <div className="app editor_override">
        <Provider store={getAppStore()}>
          <CompositorContainer />
        </Provider>
      </div>
    </div>
  );
};

export default App;
