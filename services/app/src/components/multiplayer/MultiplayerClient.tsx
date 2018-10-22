import * as React from 'react';
import {MultiplayerEvent, StatusEvent} from 'shared/multiplayer/Events';
import {getMultiplayerAction} from '../../actions/ActionTypes';
import {Connection} from '../../multiplayer/Connection';
import {MultiplayerState, SettingsType} from '../../reducers/StateTypes';

const STATUS_DEBOUNCE_MS = 1000;

export interface StateProps {
  conn: Connection;
  commitID: number;
  line: number;
  multiplayer: MultiplayerState;
  settings: SettingsType;
}

export interface DispatchProps {
  onMultiEventStart: (syncId: number) => void;
  onMultiEventComplete: () => void;
  onStatus: (client: string, instance: string, status: StatusEvent) => void;
  onAction: (action: any) => any;
}

export interface Props extends StateProps, DispatchProps {}

export default class MultiplayerClient extends React.Component<Props, {}> {
  private lastStatusMs: number;

  constructor(props: Props) {
    super(props);
    this.lastStatusMs = 0;
    props.conn.registerEventRouter(
      (e: MultiplayerEvent) => {this.handleEvent(e); },
      (p?: StatusEvent) => {this.sendStatus(p); }
    );
  }

  public sendStatus(partialStatus?: StatusEvent): void {
    const now = Date.now();
    // Debounce status (don't send too often)
    if (now - this.lastStatusMs < STATUS_DEBOUNCE_MS) {
      return;
    }

    const selfStatus = (this.props.multiplayer && this.props.multiplayer.clientStatus && this.props.multiplayer.clientStatus[this.props.conn.getClientKey()]);
    let event: StatusEvent = {
      connected: true,
      lastEventID: this.props.commitID,
      line: this.props.line,
      numLocalPlayers: (this.props.settings && this.props.settings.numLocalPlayers) || 1,
      type: 'STATUS',
      waitingOn: (selfStatus && selfStatus.waitingOn),
    };
    if (partialStatus) {
      event = {...event, ...partialStatus};
    }

    // Send remote and also publish locally
    this.props.conn.sendEvent(event);
    const [client, instance] = this.props.conn.getClientAndInstance();
    this.props.onStatus(client, instance, event);
    this.props.conn.publish({
      client,
      event,
      id: null,
      instance,
    });

    this.lastStatusMs = now;
  }

  public handleEvent(e: MultiplayerEvent): Promise<void>|null {
    if (e.id && e.id !== (this.props.commitID + 1)) {
      // We should ignore actions that we don't expect, and instead let the server
      // know we're behind so we can fast-forward appropriately.
      // Note that MULTI_EVENTs have no top-level ID and aren't affected by this check.
      console.log('Ignoring #' + e.id + ' ' + e.event.type + ' (counter at #' + this.props.commitID + ')');
      this.sendStatus();
      return null;
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
          return null;
        }

        // If the server is describing an event and we have a similar ID in-flight,
        // cancel the in-flight event in favor of the server's opinion.
        // This can happen in edge cases, e.g. client sends event A, connection flaps,
        // server responds to client status with MULTI_ACTION on event A.
        if (this.props.conn.hasInFlight(e.id)) {
          this.props.conn.removeFromQueue(e.id);

          // If the event came from us, commit it. Otherwise, reject the
          // local in-flight event.
          const [client, instance] = this.props.conn.getClientAndInstance();
          if (e.client === client && e.instance === instance) {
            this.props.conn.committedEvent(e.id);
          } else {
            this.props.conn.rejectedEvent(e.id, 'Multiplayer ACTION matching inflight');
          }
          return null;
        }

        const a = getMultiplayerAction(body.name);
        if (!a) {
          console.error('Received unknown remote action ' + body.name);
          return null;
        }

        console.log('WS: Inbound #' + e.id + ': ' + body.name + '(' + body.args + ')');
        // Set a "remote" inflight marker so it's identifiable
        // when debugging.
        const action = a(JSON.parse(body.args));
        (action as any)._inflight = 'remote';

        let result: any;
        try {
          result = this.props.onAction(action);
        } finally {
          if (e.id !== null) {
            this.props.conn.removeFromQueue(e.id);
            this.props.conn.committedEvent(e.id);
          }
        }
        return result;
      case 'MULTI_EVENT':
        if (this.props.multiplayer.multiEvent) {
          console.log('Ignoring MULTI_EVENT, already parsing');
          return null;
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
                const route: any = this.handleEvent(parsed);
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
          this.props.conn.committedEvent(e.id);
        }
    }
    this.props.conn.publish(e);
    return null;
  }

  public render(): JSX.Element|null {
    return null;
  }
}
