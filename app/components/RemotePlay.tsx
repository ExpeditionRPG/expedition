import * as React from 'react'
import Card from './base/Card'
import Button from './base/Button'
import {getAppVersion} from'../Globals'
import {SettingsType, UserState} from '../reducers/StateTypes'

export interface RemotePlayStateProps {
}

export interface RemotePlayDispatchProps {
}

export interface RemotePlayProps extends RemotePlayStateProps, RemotePlayDispatchProps {}

const RemotePlay = (props: RemotePlayProps): JSX.Element => {
  return (
    <Card title="Lobby">
      <div>Herp</div>
    </Card>
  );
}

export default RemotePlay;
