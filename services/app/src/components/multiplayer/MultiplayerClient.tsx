import * as React from 'react';
import {MultiplayerEvent, StatusEvent} from 'shared/multiplayer/Events';
import {getMultiplayerAction} from '../../actions/ActionTypes';
import {Connection, ConnectionHandler} from '../../multiplayer/Connection';
import {MultiplayerState} from '../../reducers/StateTypes';

export interface StateProps {
  conn: Connection;
  commitID: number;
  multiplayer: MultiplayerState;
}

export interface DispatchProps {
  onMultiEventStart: (syncId: number) => void;
  onMultiEventComplete: () => void;
  onStatus: (client?: string, instance?: string, status?: StatusEvent) => void;
  onAction: (action: any) => any;
  onCommit: (n: number) => any;
  onReject: (n: number, error: string) => any;
  onConnectionChange: (connected: boolean) => void;
  onPublish: (e: MultiplayerEvent) => void;
  onRegisterHandler: (handler: ConnectionHandler) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default class MultiplayerClient extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    props.conn.registerHandler(this);
  }

  public onCommit(n: number) {
    this.props.onCommit(n);
  }

  public onReject(n: number, error: string) {
    this.props.onReject(n, error);
  }

  public onStatus() {
    // TODO replace with onEvent
    this.props.onStatus();
  }

  public onConnectionChange(connected: boolean) {
    this.props.onConnectionChange(connected);
  }

  public onEvent(e: MultiplayerEvent, buffered: boolean): Promise<void> {
    if (e.id && e.id !== (this.props.commitID + 1)) {
      // We should ignore actions that we don't expect, and instead let the server
      // know we're behind so we can fast-forward appropriately.
      // Note that MULTI_EVENTs have no top-level ID and aren't affected by this check.
      console.log('Ignoring #' + e.id + ' ' + e.event.type + ' (counter at #' + this.props.commitID + ')');
      this.props.onStatus();
      return Promise.resolve();
    }

    const body = e.event;
    switch (body.type) {
      case 'STATUS':
        this.props.onStatus(e.client, e.instance, body);
        break;
      case 'INTERACTION':
        // Interaction events are not dispatched; UI element subscribers pick up the event on publish().
        break;
      case 'ACTION':
        // Actions must have IDs.
        if (e.id === null) {
          return Promise.resolve();
        }

        // If the server is describing an event and we have a similar message buffered,
        // cancel the buffered event in favor of the server's opinion.
        // This can happen in edge cases, e.g. client sends event A, connection flaps,
        // server responds to client status with MULTI_ACTION on event A.
        if (buffered) {
          // If the event came from us, commit it. Otherwise, reject the
          // local buffered event.
          if (e.client === this.props.multiplayer.client && e.instance === this.props.multiplayer.instance) {
            this.props.onCommit(e.id);
          } else {
            this.props.onReject(e.id, 'Multiplayer ACTION matching buffered');
          }
          return Promise.resolve();
        }

        const a = getMultiplayerAction(body.name);
        if (!a) {
          console.error('Received unknown remote action ' + body.name);
          return Promise.resolve();
        }

        console.log('WS: Inbound #' + e.id + ': ' + body.name + '(' + body.args + ')');
        // Set a "remote" marker so we can handle it differently than local actions
        const action = a(JSON.parse(body.args));
        (action as any)._inflight = 'remote';

        let result: any;
        try {
          result = this.props.onAction(action);
        } finally {
          if (e.id !== null) {
            this.props.onCommit(e.id);
          }
        }
        return result;
      case 'MULTI_EVENT':
        if (this.props.multiplayer.multiEvent) {
          console.log('Ignoring MULTI_EVENT, already parsing');
          return Promise.resolve();
        }
        let chain = Promise.resolve().then(() => {
          this.props.onMultiEventStart(body.lastId);
        });
        for (const event of body.events) {
          let parsed: MultiplayerEvent;
          try {
            parsed = JSON.parse(event);
            if (!parsed.id) {
              throw new Error('MULTI_EVENT without ID: ' + parsed);
            }
          } catch (e) {
            console.error(e);
            continue;
          }

          // Sometimes we need to handle async actions - e.g. when calls to dispatch() return a promise in the inner routeEvent().
          // This constructs a chain of promises out of the calls to MULTI_EVENT so that async actions like fetchQuestXML are
          // allowed to complete before the next action is processed.
          // Actions are dispatched within a timeout so that react UI updates aren't blocked by
          // event routing.
          chain = chain.then((_: any) => {
            return new Promise<void>((fulfill, reject) => {
              setTimeout(() => {
                const route: any = this.onEvent(parsed, false); // TODO: should buffered be set?
                if (route && typeof(route) === 'object' && route.then) {
                  fulfill(route);
                }
                fulfill();
              }, 0);
            });
          });
        }

        chain = chain.then((_: any) => {
          this.props.onMultiEventComplete();
        });
        this.props.conn.publish(e);
        return chain;
      case 'ERROR':
        console.error(JSON.stringify(body));
        break;
      default:
        console.error('UNKNOWN EVENT ' + (body as any).type);
        if (e.id) {
          this.props.onCommit(e.id);
        }
    }
    this.props.conn.publish(e);
    return Promise.resolve();
  }

  public render(): JSX.Element|null {
    return null;
  }
}
