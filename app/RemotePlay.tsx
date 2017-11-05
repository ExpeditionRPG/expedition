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

// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();

// This is the base layer of the remote play network framework, implemented
// using firebase FireStore.
export class RemotePlayClient extends ClientBase {
  private sessionRef: firebase.firestore.DocumentReference;
  private unsubscribers: any[];

  connect(sessionID: string, authToken: string): Promise<void> {
    if (this.isConnected() || (this.unsubscribers && this.unsubscribers.length)) {
      this.disconnect();
    }
    this.unsubscribers = [];
    this.sessionRef = db.collection('sessions').doc(sessionID.toString());
    return firebase.auth().signInWithCustomToken(authToken)
      .then(() => {
        this.unsubscribers.push(this.sessionRef.collection('events').onSnapshot((events) => {
          events.docChanges.forEach((change) => {
              if (change.type !== 'added') {
                console.error('Unexpected modified or removed event: ' + JSON.stringify(change.doc.data()));
                return;
              }
              const event = change.doc.data() as RemotePlayEvent;
              // Ignore messages from ourselves
              if (event.client === this.id) {
                return;
              }
              this.handleMessage(event);
          });
        }));

        firebase.database().ref('.info/connected').on('value', (snapshot) => {
        // If we're not currently connected, don't do anything.
        if (snapshot.val() === false) {
          this.connected = false;
            return;
        } else {
          this.connected = true;
          if (this.sessionRef) {
            this.sendEvent({type: 'STATUS'});
          }
        };
        // TODO: Use onDisconnect() to set online state for others to see
        });
      });
  }

  disconnect() {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.connected = false;
    firebase.database().ref('.info/connected').off();
    firebase.database().goOffline();
  }

  sendFinalizedEvent(event: RemotePlayEvent): void {
    const start = Date.now();
    try {
      // Transparently add firebase-specific attributes the app doesn't care about
      (event as any)['added'] = start;

      this.sessionRef.collection('events').doc().set(event).then(() => {
          const runtime = (Date.now() - start);
          console.log('Firebase event (' + runtime + ' ms)');
      });
    } catch (e) {
      // Error could be either on invocation of doc().set() or on response,
      // so we use a try/catch here instead of .catch() promise handling.
      console.error('Error sending firebase event ' + JSON.stringify(event) + ' (see next error)');
      console.error(e);
    }
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
