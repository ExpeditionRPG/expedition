import Redux from 'redux';
import {renderXML} from 'shared/render/QDLParser';
import {realtimeUtils} from '../Auth';
import {
  API_HOST,
  METADATA_DEFAULTS,
  NEW_QUEST_TEMPLATE,
  PARTITIONS,
  QUEST_DOCUMENT_HEADER
} from '../Constants';
import {EditableMap, EditableModel, EditableString} from '../Editable';
import {QuestType, UserState} from '../reducers/StateTypes';
import {
  QuestLoadingAction,
  QuestMetadataChangeAction, QuestPublishingSetupAction, ReceiveQuestLoadAction,
  ReceiveQuestPublishAction,
  ReceiveQuestSaveAction, ReceiveQuestSaveErrAction,
  ReceiveQuestUnpublishAction, RequestQuestPublishAction,
  RequestQuestSaveAction, RequestQuestUnpublishAction,
} from './ActionTypes';
import {pushError, pushHTTPError} from './Dialogs';
import {startPlaytestWorker} from './Editor';
import {setSnackbar} from './Snackbar';

const ReactGA = require('react-ga') as any;
const QueryString = require('query-string');

// Loaded on index.html
declare var window: any;

function receiveQuestLoad(quest: QuestType): ReceiveQuestLoadAction {
  return {type: 'RECEIVE_QUEST_LOAD', quest};
}

export function questLoading(): QuestLoadingAction {
  return {type: 'QUEST_LOADING'};
}

function updateDriveFile(fileId: string, fileMetadata: any, text: string, callback: (err: any, result?: any) => any) {
  try {
    const boundary = '-------314159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const closeDelim = '\r\n--' + boundary + '--';

    text = QUEST_DOCUMENT_HEADER + text;
    const base64Data = btoa(window.unescape(window.encodeURIComponent(text)));
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: text/plain\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      closeDelim;

    const request = window.gapi.client.request({
      body: multipartRequestBody,
      headers: {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"',
      },
      method: 'PUT',
      params: {uploadType: 'multipart', alt: 'json'},
      path: '/upload/drive/v2/files/' + fileId,
    });
    request.then((json: any, raw: any) => {
      return callback(null, json);
    }, (json: any) => {
      return callback(json.result.error);
    });
  } catch (err) {
    return callback(err);
  }
}

export function loadQuestFromURL(user: UserState, id?: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(questLoading());
    if (id) {
      ReactGA.event({
        action: 'QUEST_LOAD_EXISTING',
        category: 'Background',
        label: id,
      });
    } else {
      ReactGA.event({
        action: 'QUEST_LOAD_NEW',
        category: 'Background',
      });
    }
    loadQuest(user, dispatch, id);
  };
}

export function newQuest(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const insertHash = {
      resource: {
        description: 'Created with the Expedition Quest Creator',
        mimeType: 'text/plain',
        title: 'New Expedition Quest',
      },
    };
    // TODO migrate this to use same upload method as updateDriveFile to remove dependency
    // on loading drive2 api
    window.gapi.client.load('drive', 'v2', () => {
      window.gapi.client.drive.files.insert(insertHash).execute((createResponse: {id: string}) => {
        updateDriveFile(createResponse.id, {}, '', (err, result) => {
          if (err) {
            return dispatch(pushError(new Error('Failed to create new quest: ' + err.message)));
          }
          loadQuest(user, dispatch, createResponse.id);
          window.gapi.client.request({
            body: {
              allowFileDiscovery: true,
              domain: 'Fabricate.io',
              role: 'writer',
              type: 'domain',
            },
            method: 'POST',
            params: {sendNotificationEmails: false},
            path: '/drive/v3/files/' + createResponse.id + '/permissions',
          }).then((json: any, raw: any) => {
            // Succeed silently
          }, (json: any) => {
            ReactGA.event({
              action: 'Error connecting quest file to Fabricate.IO',
              category: 'Error',
              label: createResponse.id,
            });
            // TODO better error handling
            // console.log('Error connecting quest file to Fabricate.IO', json);
          });
        });
      });
    });
  };
}

function getPublishedQuestMeta(publishedId: string, cb: (meta: QuestType) => any) {
  $.post(API_HOST + '/quests', JSON.stringify({id: publishedId}), (result: any) => {
    result = JSON.parse(result);
    if (result.error) {
      throw new Error(result.error);
    }
    cb(result && result.quests && result.quests[0] as QuestType);
  });
}

function createDocNotes(model: any) {
  const str = model.createString();
  model.getRoot().set('notes', str);
  return str;
}

function createDocMetadata(model: any, defaults: any) {
  const map = model.createMap();
  Object.keys(defaults).forEach((key: string) => {
    const val = defaults[key];
    // Don't allow undo - these are default values
    // https://developers.google.com/google-apps/realtime/conflict-resolution#preventing_undo
    model.beginCompoundOperation('', false);
    if (val) {
      map.set(key, val);
    }
    model.endCompoundOperation();
  });
  model.getRoot().set('metadata', map);
  return map;
}

function loadQuestFromAPI(user: UserState, dispatch: any, docid: string): Promise<{md: any, notes: any, metadata: any, model: any}|null> {
  return fetch(API_HOST + '/qdl/' + docid, {
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        method: 'GET',
    }).then((response) => {
      console.log(response);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    }).then((json: any) => {
      const md = new EditableString('md', json.data);
      const notes = new EditableString('notes', json.notes);
      const metadata = new EditableMap('metadata', json.metadata);

      if (metadata.empty()) { // Create metadata if it's an old quest w/o metadata attribute
        // Default to any metadata set in the markdown metadata
        try {
          const defaults = {
            ...METADATA_DEFAULTS,
            author: user.displayName,
            email: user.email,
            language: 'English',
            maxplayers: 6,
            minplayers: 1,
            summary: '',
          };
          metadata.setValue(defaults);
        } catch (err) {
          dispatch(pushError(new Error('Error parsing metadata. Please check your quest for validation errors, then try reloading the page. If this error persists, please contact support: Expedition@Fabricate.io')));
          ReactGA.event({
            action: 'Error parsing metadata',
            category: 'Error',
            label: docid,
          });
        }
      }
      const model = new EditableModel([md, notes, metadata]);
      return {md, notes, metadata, model};
    }).catch((error) => {
      console.error(error);
      return null;
    });
}

export function loadQuest(user: UserState, dispatch: any, docid?: string) {
  if (docid === undefined) {
    return dispatch(newQuest(user));
  }
  return loadQuestFromAPI(user, dispatch, docid)
    .then((result) => {
      if (result) {
        console.log('using result', result);
      }
      return result || loadQuestFromRealtime(user, dispatch, docid);
    })
    .then((result) => {
      const text: string = result.md.getText();
      getPublishedQuestMeta(docid, (quest: QuestType) => {
        const xmlResult = renderXML(text);
        quest = Object.assign(quest || {}, {
          author: result.metadata.get('author'),
          contentrating: result.metadata.get('contentrating'),
          email: result.metadata.get('email'),
          expansionhorror: result.metadata.get('expansionhorror') || false,
          expansionfuture: result.metadata.get('expansionfuture') || false,
          genre: result.metadata.get('genre'),
          id: docid,
          language: result.metadata.get('language') || 'English',
          maxplayers: +result.metadata.get('maxplayers'),
          maxtimeminutes: +result.metadata.get('maxtimeminutes'),
          mdRealtime: result.md,
          metadataRealtime: result.metadata,
          notesRealtime: result.notes,
          realtimeModel: result.model,
          minplayers: +result.metadata.get('minplayers'),
          mintimeminutes: +result.metadata.get('mintimeminutes'),
          requirespenpaper: result.metadata.get('requirespenpaper') || false,
          summary: result.metadata.get('summary'),
          theme: result.metadata.get('theme') || 'base',
          title: xmlResult.getMeta().title,
        });
        dispatch(receiveQuestLoad(quest));
        dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});
        // Kick off a playtest after allowing the main thread to re-paint
        setTimeout(() => dispatch(startPlaytestWorker(null, xmlResult.getResult(), {
          expansionhorror: Boolean(quest.expansionhorror),
          expansionfuture: Boolean(quest.expansionfuture),
        })), 0);
      });
    });
}

export function loadQuestFromRealtime(user: UserState, dispatch: any, docid: string): Promise<{md: any, notes: any, metadata: any, model: any}> {
  return new Promise((resolve, reject) => {
    realtimeUtils.load(docid, (doc: any) => {
      window.location.hash = docid;
      doc.addEventListener('collaborator_joined', (e: any) => {
        ReactGA.event({
          action: 'COLLABORATOR_JOINED',
          category: 'Background',
          label: docid,
        });
      });
      const md = doc.getModel().getRoot().get('markdown');
      let notes = doc.getModel().getRoot().get('notes');
      let metadata = doc.getModel().getRoot().get('metadata');

      if (!notes) { // Create notes if it's an old quest w/o notes attribute
        notes = createDocNotes(doc.getModel());
      }

      if (!metadata) { // Create metadata if it's an old quest w/o metadata attribute
        // Default to any metadata set in the markdown metadata (migrate from the old format)
        try {
          const defaults = {
            ...METADATA_DEFAULTS,
            author: user.displayName,
            email: user.email,
            language: 'English',
            maxplayers: 6,
            minplayers: 1,
            summary: '',
          };
          metadata = createDocMetadata(doc.getModel(), defaults);
        } catch (err) {
          dispatch(pushError(new Error('Error parsing metadata. Please check your quest for validation errors, then try reloading the page. If this error persists, please contact support: Expedition@Fabricate.io')));
          ReactGA.event({
            action: 'Error parsing metadata',
            category: 'Error',
            label: docid,
          });
        }
      }
      resolve({md, notes, metadata, model: doc.getModel()});
    },
    (model: any) => {
      const str = model.createString();
      // Don't allow user undo, since it would revert everything back to a blank page.
      // https://developers.google.com/google-apps/realtime/conflict-resolution#preventing_undo
      model.beginCompoundOperation('', false);
      str.setText(NEW_QUEST_TEMPLATE);
      model.endCompoundOperation();
      model.getRoot().set('markdown', str);
      createDocNotes(model);
    });
  });
}

export function questMetadataChange(quest: QuestType, key: string, value: any):
  ((dispatch: Redux.Dispatch<any>) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Don't allow undo, since these are set via UI and users don't expect Ctrl+Z to affec them.
    // https://developers.google.com/google-apps/realtime/conflict-resolution#preventing_undo
    quest.realtimeModel.beginCompoundOperation('', false);
    quest.metadataRealtime.set(key, value);
    quest.realtimeModel.endCompoundOperation();
    dispatch({type: 'QUEST_METADATA_CHANGE', key, value} as QuestMetadataChangeAction);
  };
}

export function publishQuestSetup(): ((dispatch: Redux.Dispatch<any>) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'QUEST_PUBLISHING_SETUP'} as QuestPublishingSetupAction);
  };
}

export function publishQuest(quest: QuestType, majorRelease?: boolean, privatePublish?: boolean):
  ((dispatch: Redux.Dispatch<any>) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const renderResult = renderXML(quest.mdRealtime.getText());
    dispatch({type: 'QUEST_RENDER', qdl: renderResult, msgs: renderResult.getFinalizedLogs()});
    dispatch({type: 'REQUEST_QUEST_PUBLISH', quest} as RequestQuestPublishAction);
    const params = QueryString.stringify({
      author: quest.author,
      contentrating: quest.contentrating,
      email: quest.email,
      expansionhorror: quest.expansionhorror,
      expansionfuture: quest.expansionfuture,
      genre: quest.genre,
      language: quest.language,
      majorRelease,
      maxplayers: quest.maxplayers,
      maxtimeminutes: quest.maxtimeminutes,
      minplayers: quest.minplayers,
      mintimeminutes: quest.mintimeminutes,
      partition: (privatePublish) ? PARTITIONS.PRIVATE : PARTITIONS.PUBLIC,
      requirespenpaper: quest.requirespenpaper,
      summary: quest.summary,
      theme: quest.theme,
      title: quest.title,
    });
    return $.ajax({
      data: renderResult.getResult() + '',
      type: 'POST',
      url: API_HOST + '/publish/' + quest.id + '?' + params,
    }).done((resultQuestId: string) => {
      quest.published = (new Date(Date.now()).toISOString());
      dispatch({type: 'RECEIVE_QUEST_PUBLISH', quest} as ReceiveQuestPublishAction);
      dispatch(setSnackbar(true, 'Quest published successfully!'));
      // Makes up for the fact that auto-sharing on creation falls apart if the Google Doc
      // was created before https://github.com/ExpeditionRPG/expedition-quest-creator/pull/282
      window.gapi.client.request({
        body: {
          allowFileDiscovery: true,
          domain: 'Fabricate.io',
          role: 'writer',
          type: 'domain',
        },
        method: 'POST',
        params: {sendNotificationEmails: false},
        path: '/drive/v3/files/' + quest.id + '/permissions',
      }).then((json: any, raw: any) => {
        // Silent success
      }, (json: any) => {
        ReactGA.event({
          action: 'Error connecting quest file to Fabricate.IO on publish',
          category: 'Error',
          label: quest.id,
        });
        // TODO better error logging
        // console.log('Error connecting quest file to Fabricate.IO on publish', json);
      });
    }).fail((error: any) => {
      // TODO FIXME / upgrade to Fetch
      dispatch(pushHTTPError(error));
    });
  };
}

export function saveQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'REQUEST_QUEST_SAVE', quest} as RequestQuestSaveAction);

    const data = quest.mdRealtime.getText();
    const notes = quest.notesRealtime.getText();

    const notesCommented = '\n\n// QUEST NOTES\n// ' + notes.replace(/\n/g, '\n// ');
    const text: string = data + notesCommented;

    const xmlResult = renderXML(text);
    dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});

    const meta = xmlResult.getMeta();
    // For all metadata values, see https://developers.google.com/drive/v2/reference/files
    const fileMeta = {
      description: meta.summary,
      title: meta.title + '.quest',
    };

    if (quest.id === undefined) {
      throw new Error('Undefined quest ID');
    }
    updateDriveFile(quest.id, fileMeta, text, (err, result) => {
      if (err) {
        ReactGA.event({
          action: 'Error saving quest',
          category: 'Error',
          label: quest.id,
        });
        dispatch({type: 'RECEIVE_QUEST_SAVE_ERR', err: err.message} as ReceiveQuestSaveErrAction);
      } else {
        ReactGA.event({
          action: 'Quest Save',
          category: 'Background',
        });
        dispatch({type: 'RECEIVE_QUEST_SAVE', meta} as ReceiveQuestSaveAction);
      }
    });
    return fetch(API_HOST + '/save/quest/' + quest.id, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        referrer: 'no-referrer',
        body: JSON.stringify({data, notes}),
    }).then((response) => {
      console.log(response);
    });
  };
}

export function unpublishQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'REQUEST_QUEST_UNPUBLISH', quest} as RequestQuestUnpublishAction);
    return $.post(API_HOST + '/unpublish/' + quest.id, (resultQuestId: string) => {
      quest.published = undefined;
      dispatch({type: 'RECEIVE_QUEST_UNPUBLISH', quest} as ReceiveQuestUnpublishAction);
      dispatch(setSnackbar(true, 'Quest un-published successfully!'));
    }).fail((error: any) => {
      // TODO FIXME / upgrade to Fetch
      dispatch(pushHTTPError(error));
    });
  };
}
