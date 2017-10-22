import Redux from 'redux'
import {RemotePlayEvent, ClientID} from 'expedition-qdl/lib/remote/Events'
import {ClientBase} from 'expedition-qdl/lib/remote/Client'
import {local} from './actions/RemotePlay'
import * as Bluebird from 'bluebird'
import * as firebase from 'firebase'
require('firebase/firestore'); // Needed as side effect to use firestore

firebase.initializeApp({
  apiKey: 'AIzaSyAVJX4xTB6eREniGPl6QmreR4y_rtxeSCY',
  authDomain: 'expedition-remote-play.firebaseapp.com',
  databaseURL: 'https://expedition-remote-play.firebaseio.com',
  projectId: 'expedition-remote-play',
  storageBucket: 'expedition-remote-play.appspot.com',
  messagingSenderId: '22607012202',
});

const REMOTEPLAY_CLIENT_STATUS_POLL_MS = 5000;

console.log(firebase);

// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();

// The base layer of the remote play network framework. Key features:
// - handling of web socket connections
// - reconnect policy
// - Serializing "executable arrays" and broadcasting them
// - Unpacking and executing serialized actions locally
export class RemotePlayClient extends ClientBase {
  private sessionRef: firebase.firestore.DocumentReference;
  private connected: boolean;
  private unsubscribers: any[];


  connect(sessionID: string): Bluebird<{}> {
    if (this.isConnected() || (this.unsubscribers && this.unsubscribers.length)) {
      this.disconnect();
    }
    this.unsubscribers = [];
    this.sessionRef = db.collection('sessions').doc(sessionID.toString());


    this.unsubscribers.push(this.sessionRef.collection('events').onSnapshot((events) => {
      events.docChanges.forEach((change) => {
          if (change.type !== 'added') {
            console.log('Mod or removed events. This is weird! TODO');
            return;
          }
          this.handleMessage(change.doc.data() as RemotePlayEvent);
      });
    }));


    this.sessionRef.set({lastUpdate: Date.now()}).then(() => {
      firebase.database().ref('.info/connected').on('value', (snapshot) => {
      // If we're not currently connected, don't do anything.
      if (snapshot.val() === false) {
        this.connected = false;
          return;
      } else {
        console.log('Connected!');
        this.connected = true;
        if (this.sessionRef) {
          this.sendEvent({type: 'STATUS', status: {line: 0, waiting: false}});
        }
      };
      // TODO: Use onDisconnect() to set online state for others to see
      });
    });

    return Bluebird.resolve({});
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect() {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.connected = false;
    firebase.database().ref('.info/connected').off();
    firebase.database().goOffline();
  }

  sendEvent(e: any): void {
    if (!this.isConnected()) {
      return;
    }
    console.log('Starting transaction');
    const start = Date.now();
    const event: RemotePlayEvent = {client: this.id, event: e};
    db.runTransaction((txn) => {
        // This code may get re-run multiple times if there are conflicts.
        return txn.get(this.sessionRef).then((sessionDoc) => {
          // Update the main document here, to prevent concurrent events from causing conflicts.
          txn.update(this.sessionRef, {lastUpdate: Date.now()});
          txn.set(this.sessionRef.collection('events').doc(), event);
        });
    }).then(() => {
        const runtime = (Date.now() - start);
        console.log('Event published - took ' + runtime + ' ms');
    }).catch((error) => {
        console.error(error);
    });
  }

  public createActionMiddleware(): Redux.Middleware {
    return ({dispatch, getState}: Redux.MiddlewareAPI<any>) => (next: Redux.Dispatch<any>) => (action: any) => {
      const dispatchLocal = (a: Redux.Action) => {dispatch(local(a));};

      if (!action) {
        next(action);
        return;
      }

      const localOnly = (action.type === 'LOCAL');
      if (localOnly) {
        // Unwrap local actions
        action = action.action;
      }

      if (action instanceof Array) {
        const [name, fn, args] = action;
        const remoteArgs = fn(args, dispatchLocal, getState);
        if (remoteArgs && !localOnly) {
          const argstr = JSON.stringify(remoteArgs);
          console.log('Outbound: ' + name + '(' + argstr + ')');
          this.sendEvent({type: 'ACTION', name, args: argstr});
        }
      } else if (typeof(action) === 'function') {
        // Dispatch async actions
        action(dispatchLocal, getState);
      } else {
        // Pass through regular action objects
        next(action);
      }
    }
  }
}

// TODO: Proper device ID
let client: RemotePlayClient = null;
export function getRemotePlayClient(): RemotePlayClient {
  if (client !== null) {
    return client
  }
  client = new RemotePlayClient();
  return client;
}
