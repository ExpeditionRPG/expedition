import Redux from 'redux';
import {UserState} from 'shared/auth/UserState';
import {renderXML} from 'shared/render/QDLParser';
import {API_HOST} from 'shared/schema/Constants';
import {Partition} from 'shared/schema/Constants';
import {
  METADATA_DEFAULTS,
  NEW_QUEST_TEMPLATE,
  QUEST_DOCUMENT_HEADER
} from '../Constants';
import {EditableMap, EditableModel, EditableString} from '../Editable';
import {QuestType} from '../reducers/StateTypes';
import {
  QuestLoadingAction,
  QuestMetadataChangeAction, QuestPublishingSetupAction, ReceiveQuestLoadAction,
  ReceiveQuestPublishAction,
  ReceiveQuestSaveAction, ReceiveQuestSaveErrAction,
  ReceiveQuestUnpublishAction, RequestQuestPublishAction,
  RequestQuestSaveAction, RequestQuestUnpublishAction,
} from './ActionTypes';
import {pushError, pushHTTPError} from './Dialogs';
import {setFatal, startPlaytestWorker, updateDirtyState} from './Editor';
import {setSnackbar} from './Snackbar';

const ReactGA = require('react-ga') as any;
const QueryString = require('query-string');

export interface LoadResult {
  data: string;
  notes: string;
  metadata: any;
  edittime: Date;
}

export const QUEST_NOTES_HEADER = '\n\n// QUEST NOTES\n';

// Loaded on index.html
declare var window: any;

function receiveQuestLoad(quest: QuestType): ReceiveQuestLoadAction {
  return {type: 'RECEIVE_QUEST_LOAD', quest};
}

export function questLoading(): QuestLoadingAction {
  return {type: 'QUEST_LOADING'};
}

function formatNotes(notes: string) {
  return notes.split('\n').map((l) => {
    if (l.startsWith('// ')) {
      return l.substr(3);
    }
    return l;
  }).reduce((a, b) => `${a}\n${b}`);
}

function loadQuestFromDrive(fileId: string, edittime: Date): Promise<LoadResult> {
  return Promise.resolve().then(() => {
    return window.gapi.client.request({
      method: 'GET',
      path: `https://www.googleapis.com/drive/v2/files/${fileId}?alt=media`,
    });
  }).then((json: any) => {
    if (!json.body) {
      throw new Error(`Could not read from Drive API (${json.status}): ${json.statusText}`);
    }

    const dataStart = json.body.indexOf('#');
    const dataEnd = json.body.indexOf(QUEST_NOTES_HEADER);

    return {
      data: json.body.substr(dataStart, (dataEnd >= 0) ? (dataEnd - dataStart) : undefined),
      notes: (dataEnd >= 0) ? formatNotes(json.body.substr(dataEnd + QUEST_NOTES_HEADER.length)) : '',
      metadata: {}, // Metadata not saved to quests
      edittime,
    };
  }, (json: any) => {
    throw new Error(json.result.error);
  });
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
    dispatch(loadQuest(user, id));
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
          // save an equivalent to the API server
          saveQuestInternal(createResponse.id, NEW_QUEST_TEMPLATE, '', '').then(() => {
            dispatch(loadQuest(user, createResponse.id));
          });
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
          });
        });
      });
    });
  };
}

function getPublishedQuestMeta(publishedId: string): Promise<QuestType|null> {
  return fetch(API_HOST + '/quests', {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
    },
    referrer: 'no-referrer',
    body: JSON.stringify({id: publishedId}),
  })
  .then((response) => {
    if (!response.ok) {
      return null;
    }
    return response.json();
  })
  .then((result) => {
    if (!result || result.error) {
      return null;
    }
    return result && result.quests && result.quests[0] as QuestType;
  });
}

function loadQuestFromAPI(user: UserState, docid: string, edittime: Date): Promise<LoadResult> {
  return fetch(`${API_HOST}/qdl/${docid}/${edittime.getTime()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'text/plain',
        },
        method: 'GET',
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response.json();
    }).then((json: any) => {
      return {
        data: json.data || '',
        notes: json.notes || '',
        metadata: json.metadata || {},
        edittime: json.edittime || edittime,
      };
    });
}

export function loadQuest(user: UserState, docid?: string, edittime: Date = new Date()) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (docid === undefined) {
      return dispatch(newQuest(user));
    }
    return loadQuestFromAPI(user, docid, edittime)
      .catch((e) => {
        // Fall back to Drive API if we get an API error
        console.error(e);
        return loadQuestFromDrive(docid, edittime);
      })
      .then((result) => {
        window.location.hash = docid;
        const md = new EditableString('md', result.data);
        const notes = new EditableString('notes', result.notes);
        const metadata = new EditableMap('metadata', result.metadata);

        if (metadata.isEmpty()) { // Create metadata if it's an old quest w/o metadata attribute
          // Default to any metadata set in the markdown metadata
          try {
            const defaults = {
              ...METADATA_DEFAULTS,
              author: user.name,
              email: user.email,
              language: 'English',
              maxplayers: 6,
              minplayers: 1,
              summary: '',
            };
            metadata.setValue(defaults);
          } catch (err) {
            console.error(err);
            dispatch(pushError(new Error('Error parsing metadata. Please check your quest for validation errors, then try reloading the page. If this error persists, please contact support: Expedition@Fabricate.io')));
            ReactGA.event({
              action: 'Error parsing metadata',
              category: 'Error',
              label: docid,
            });
          }
        }
        const model = new EditableModel([md, notes, metadata]);
        const text: string = md.getText();
        return getPublishedQuestMeta(docid).then((quest: QuestType) => {
          const xmlResult = renderXML(text);
          quest = Object.assign(quest || {}, {
            author: metadata.get('author'),
            contentrating: metadata.get('contentrating'),
            email: metadata.get('email'),
            expansionhorror: metadata.get('expansionhorror') || false,
            expansionfuture: metadata.get('expansionfuture') || false,
            expansionscarredlands: metadata.get('expansionscarredlands') || false,
            genre: metadata.get('genre'),
            id: docid,
            language: metadata.get('language') || 'English',
            maxplayers: parseInt(metadata.get('maxplayers') as any, 10),
            maxtimeminutes: parseInt(metadata.get('maxtimeminutes') as any, 10),
            mdRealtime: md,
            metadataRealtime: metadata,
            notesRealtime: notes,
            realtimeModel: model,
            minplayers: parseInt(metadata.get('minplayers') as any, 10),
            mintimeminutes: parseInt(metadata.get('mintimeminutes') as any, 10),
            requirespenpaper: metadata.get('requirespenpaper') || false,
            summary: metadata.get('summary'),
            theme: metadata.get('theme') || 'base',
            title: xmlResult.getMeta().title,
            edittime: result.edittime,
          });
          dispatch(receiveQuestLoad(quest));
          dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});
          // Kick off a playtest after allowing the main thread to re-paint
          setTimeout(() => dispatch(startPlaytestWorker(null, xmlResult.getResult(), {
            expansionhorror: Boolean(quest.expansionhorror),
            expansionfuture: Boolean(quest.expansionfuture),
            expansionscarredlands: Boolean(quest.expansionscarredlands),
          })), 0);
        });
      })
      .catch((e: Error) => {
        dispatch(setFatal(e.toString()));
      });
  };
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
    dispatch(updateDirtyState());
  };
}

export function publishQuestSetup(): ((dispatch: Redux.Dispatch<any>) => any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'QUEST_PUBLISHING_SETUP'} as QuestPublishingSetupAction);
  };
}

export function publishQuest(quest: QuestType, majorRelease?: boolean, privatePublish?: boolean): ((dispatch: Redux.Dispatch<any>) => any) {
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
      expansionscarredlands: quest.expansionfuture,
      genre: quest.genre,
      language: quest.language,
      majorRelease,
      maxplayers: quest.maxplayers,
      maxtimeminutes: quest.maxtimeminutes,
      minplayers: quest.minplayers,
      mintimeminutes: quest.mintimeminutes,
      partition: (privatePublish) ? Partition.expeditionPrivate : Partition.expeditionPublic,
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
    const metadata = quest.metadataRealtime.getValue();
    return saveQuestInternal(quest.id, data, notes, metadata, quest.edittime).then((response: {meta: any, xmlResult: any}) => {
      dispatch({type: 'QUEST_RENDER', qdl: response.xmlResult, msgs: response.xmlResult.getFinalizedLogs()});
      ReactGA.event({
        action: 'Quest Save',
        category: 'Background',
      });
      dispatch({type: 'RECEIVE_QUEST_SAVE', meta: response.meta} as ReceiveQuestSaveAction);
    }).catch((error: Error) => {
      ReactGA.event({
        action: 'Error saving quest',
        category: 'Error',
        label: quest.id,
      });
      dispatch({type: 'RECEIVE_QUEST_SAVE_ERR', err: error.toString()} as ReceiveQuestSaveErrAction);
    });
  };
}

function saveQuestInternal(id: string|undefined, data: string, notes: string, metadata: string, edittime: Date = new Date()): Promise<{meta: any, xmlResult: any}> {
  if (id === undefined) {
    return Promise.reject(new Error('Undefined quest ID'));
  }

  const notesCommented = QUEST_NOTES_HEADER + '// ' + notes.replace(/\n/g, '\n// ');
  const text: string = data + notesCommented;
  const xmlResult = renderXML(text);
  const meta = xmlResult.getMeta();
  // For all metadata values, see https://developers.google.com/drive/v2/reference/files
  const fileMeta = {
    description: meta.summary,
    title: meta.title + '.quest',
  };

  return new Promise((resolve, reject) => {
    updateDriveFile(id, fileMeta, text, (err: Error|null, result: any) => {
      if (err) {
        throw err;
      }
      resolve(result);
    });
  }).then(() => {
    return fetch(`${API_HOST}/save/quest/${id}`, {
        method: 'POST',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        referrer: 'no-referrer',
        body: JSON.stringify({data, notes, metadata, edittime: edittime.getTime()}),
    }).then((response) => {
      if (!response.ok) {
        return response.text();
      }
      return Promise.resolve(null);
    });
  }).then((err: string|null) => {
    if (err) {
      console.error(err);
      throw new Error(err);
    }
    return {meta, xmlResult};
  });
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
