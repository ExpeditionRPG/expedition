import * as React from 'react'

import Main from 'expedition-app/app/components/base/Main.tsx'

require('expedition-app/app/style.scss')

import CombinedReducers from 'expedition-app/app/reducers/CombinedReducers'
import {AppStateWithHistory} from 'expedition-app/app/reducers/StateTypes'

export interface AppDispatchProps {
}

const App = (props: any): JSX.Element => {
  return (
    <div className="app">
      <Main/>
    </div>
  );
};

export default App;