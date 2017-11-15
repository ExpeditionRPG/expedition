import {SessionID, BrokerBase, Session, SessionSecret, SessionMetadata} from 'expedition-qdl/lib/remote/Broker'
import {ClientID, RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'

import Config from '../config'
import * as Bluebird from 'bluebird';

import * as firebaseAdmin from 'firebase-admin';

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert((typeof Config.get('FIREBASE_SERVICE_KEY') === 'string') ? JSON.parse(Config.get('FIREBASE_SERVICE_KEY')) : Config.get('FIREBASE_SERVICE_KEY'))
});

const db = firebaseAdmin.firestore();

export class Broker extends BrokerBase {
  storeSession(s: Session): Promise<Session> {
    // TODO: Validation
    return db.collection('sessions').doc(s.id.toString()).set(s)
      .then((result) => {
        return s;
      });
  };

  fetchSessionBySecret(secret: SessionSecret): Promise<Session> {
    return db.collection('sessions')
      .where('secret', '==', secret)
      .where('lock', '==', null).limit(1).get()
      .then((sessions) => {
        if (!sessions || sessions.empty) {
          throw new Error('Session not found');
        }

        return sessions.docs[0].data();
      });
  };

  fetchSessionById(id: SessionID): Promise<Session> {
    return db.collection('sessions')
      .where('id', '==', id)
      .limit(1)
      .get()
      .then((sessions) => {
        if (!sessions || sessions.empty) {
          throw new Error('Session not found');
        }

        return sessions.docs[0].data();
      });
  };

  fetchSessionsByClient(cid: ClientID): Promise<SessionMetadata[]> {
    console.log('Checking existence of CID ' + cid);
    return db.collection('clients').doc(cid).collection('sessions')
      .orderBy('added', 'desc')
      .limit(10).get()
      .then((sessions) => {
        if (!sessions || sessions.empty) {
          return [];
        }

        return Promise.all(sessions.docs.map((snapshot) => {
          // Get last action on this session
          const result: SessionMetadata = {id: snapshot.data().id};
          return db.collection('sessions').doc(result.id.toString()).collection('events')
            .orderBy('added', 'desc').limit(1).get()
            .then((events) => {
              if (!events || events.docs.length < 1) {
                return null;
              }
              result.lastAction = events.docs[0].data().added;
              return db.collection('sessions').doc(result.id.toString()).collection('clients').get();
            })
            .then((clients) => {
              if (!clients) {
                return null;
              }
              result.peerCount = clients.docs.length;
              return result;
            });
        }))
        .then((results) => {
          // Don't return unresolved sessions or sessions where there's no
          // recent events.
          const ageThreshold = Date.now() - 60*60*4;
          return results.filter((s) => {
            return s !== null && s.lastAction > ageThreshold;
          });
        });
      });
  }

  addClient(c: ClientID, s: Session): Promise<boolean> {
    const sid = s.id.toString();
    const cid = c.toString();
    return db.collection('sessions').doc(sid).collection('clients').doc(cid).set({
      id: c,
      added: Date.now(),
    })
    .then(() => {
      // Also update list of clients' sessions for searchability
      return db.collection('clients').doc(cid).collection('sessions').doc(sid).set({
        id: sid,
        added: Date.now()
      });
    })
    .then(() => {
      return true;
    });
  };

  createAuthToken(c: ClientID): Promise<string> {
    return firebaseAdmin.auth().createCustomToken(c);
  }
}

const broker = new Broker();
export default broker;
