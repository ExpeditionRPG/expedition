import Redux from 'redux'
import {
  ReceiveQuestLoadAction,
  RequestQuestSaveAction, ReceiveQuestSaveAction, ReceiveQuestSaveErrAction,
  QuestLoadingAction,
  QuestPublishingSetupAction, QuestMetadataChangeAction,
  RequestQuestPublishAction, ReceiveQuestPublishAction,
  RequestQuestUnpublishAction, ReceiveQuestUnpublishAction,
} from './ActionTypes'
import {setSnackbar} from './Snackbar'
import {QuestType, UserState} from '../reducers/StateTypes'

import {pushError, pushHTTPError} from './Dialogs'
import {startPlaytestWorker} from './Editor'
import {realtimeUtils} from '../Auth'
import {
  NEW_QUEST_TEMPLATE,
  QUEST_DOCUMENT_HEADER,
  METADATA_DEFAULTS,
  API_HOST,
  PARTITIONS
} from '../Constants'
import {renderXML} from 'shared/render/QDLParser'

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
        'path': '/upload/drive/v2/files/' + fileId,
        'method': 'PUT',
        'params': {'uploadType': 'multipart', 'alt': 'json'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"',
        },
        'body': multipartRequestBody});
    request.then((json: any, raw: any) => {
      return callback(null, json);
    }, (json: any) => {
      return callback(json.result.error);
    });
  } catch(err) {
    return callback(err);
  }
}

export function loadQuestFromURL(user: UserState, id?: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(questLoading());
    if (id) {
      ReactGA.event({
        category: 'Background',
        action: 'QUEST_LOAD_EXISTING',
        label: id,
      });
    } else {
      ReactGA.event({
        category: 'Background',
        action: 'QUEST_LOAD_NEW',
      });
    }
    loadQuest(user, dispatch, id);
  }
}

export function newQuest(user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const insertHash = {
      resource: {
        mimeType: 'text/plain',
        title: 'New Expedition Quest',
        description: 'Created with the Expedition Quest Creator',
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
            path: '/drive/v3/files/' + createResponse.id + '/permissions',
            method: 'POST',
            params: {sendNotificationEmails: false},
            body: {
              role: 'writer',
              type: 'domain',
              domain: 'Fabricate.io',
              allowFileDiscovery: true,
            },
          }).then((json: any, raw: any) => {
          }, (json: any) => {
            ReactGA.event({
              category: 'Error',
              action: 'Error connecting quest file to Fabricate.IO',
              label: createResponse.id,
            });
            console.log('Error connecting quest file to Fabricate.IO', json);
          });
        });
      });
    });
  }
}

function getPublishedQuestMeta(publishedId: string, cb: (meta: QuestType)=>any) {
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

export function loadQuest(user: UserState, dispatch: any, docid?: string) {
  if (docid === undefined) {
    console.log('Creating new quest');
    return dispatch(newQuest(user));
  }
  realtimeUtils.load(docid, function(doc: any) {
    window.location.hash = docid;
    doc.addEventListener('collaborator_joined', (e: any) => {
      ReactGA.event({
        category: 'Background',
        action: 'COLLABORATOR_JOINED',
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
          summary: '',
          author: user.displayName,
          email: user.email,
          minplayers: 1,
          maxplayers: 6,
          language: 'English',
        };
        metadata = createDocMetadata(doc.getModel(), defaults);
      } catch(err) {
        dispatch(pushError(new Error('Error parsing metadata. Please check your quest for validation errors, then try reloading the page. If this error persists, please contact support: Expedition@Fabricate.io')));
        ReactGA.event({
          category: 'Error',
          action: 'Error parsing metadata',
          label: docid,
        });
        console.log(err);
      }
    }

    const text: string = md.getText();
    getPublishedQuestMeta(docid, (quest: QuestType) => {
      const xmlResult = renderXML(text);
      quest = Object.assign(quest || {}, {
        id: docid,
        mdRealtime: md,
        notesRealtime: notes,
        metadataRealtime: metadata,
        realtimeModel: doc.getModel(),
        title: xmlResult.getMeta().title,
        summary: metadata.get('summary'),
        author: metadata.get('author'),
        email: metadata.get('email'),
        minplayers: +metadata.get('minplayers'),
        maxplayers: +metadata.get('maxplayers'),
        mintimeminutes: +metadata.get('mintimeminutes'),
        maxtimeminutes: +metadata.get('maxtimeminutes'),
        genre: metadata.get('genre'),
        contentrating: metadata.get('contentrating'),
        expansionhorror: metadata.get('expansionhorror') || false,
        language: metadata.get('language') || 'English',
        theme: metadata.get('theme') || 'base',
        requirespenpaper: metadata.get('requirespenpaper') || false,
      });
      dispatch(receiveQuestLoad(quest));
      dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});
      // Kick off a playtest after allowing the main thread to re-paint
      setTimeout(() => dispatch(startPlaytestWorker(null, xmlResult.getResult(), {
        expansionhorror: Boolean(quest.expansionhorror),
      })), 0);
    });
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
}

export function questMetadataChange(quest: QuestType, key: string, value: any): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Don't allow undo, since these are set via UI and users don't expect Ctrl+Z to affec them.
    // https://developers.google.com/google-apps/realtime/conflict-resolution#preventing_undo
    quest.realtimeModel.beginCompoundOperation('', false);
    quest.metadataRealtime.set(key, value);
    quest.realtimeModel.endCompoundOperation();
    dispatch({type: 'QUEST_METADATA_CHANGE', key, value} as QuestMetadataChangeAction);
  }
}

export function publishQuestSetup(): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'QUEST_PUBLISHING_SETUP'} as QuestPublishingSetupAction);
  }
}

export function publishQuest(quest: QuestType, majorRelease?: boolean, privatePublish?: boolean): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const renderResult = renderXML(quest.mdRealtime.getText());
    dispatch({type: 'QUEST_RENDER', qdl: renderResult, msgs: renderResult.getFinalizedLogs()});
    dispatch({type: 'REQUEST_QUEST_PUBLISH', quest} as RequestQuestPublishAction);
    const params = QueryString.stringify({
      title: quest.title,
      summary: quest.summary,
      author: quest.author,
      email: quest.email,
      minplayers: quest.minplayers,
      maxplayers: quest.maxplayers,
      mintimeminutes: quest.mintimeminutes,
      maxtimeminutes: quest.maxtimeminutes,
      genre: quest.genre,
      contentrating: quest.contentrating,
      partition: (privatePublish) ? PARTITIONS.PRIVATE : PARTITIONS.PUBLIC,
      majorRelease,
      expansionhorror: quest.expansionhorror,
      language: quest.language,
      theme: quest.theme,
      requirespenpaper: quest.requirespenpaper,
    });
    return $.ajax({
      type: 'POST',
      url: API_HOST + '/publish/' + quest.id + '?' + params,
      data: renderResult.getResult()+'',
    }).done((resultQuestId: string) => {
      quest.published = (new Date(Date.now()).toISOString());
      dispatch({type: 'RECEIVE_QUEST_PUBLISH', quest} as ReceiveQuestPublishAction);
      dispatch(setSnackbar(true, 'Quest published successfully!'));
      // Makes up for the fact that auto-sharing on creation falls apart if the Google Doc
      // was created before https://github.com/ExpeditionRPG/expedition-quest-creator/pull/282
      window.gapi.client.request({
        path: '/drive/v3/files/' + quest.id + '/permissions',
        method: 'POST',
        params: {sendNotificationEmails: false},
        body: {
          role: 'writer',
          type: 'domain',
          domain: 'Fabricate.io',
          allowFileDiscovery: true,
        },
      }).then((json: any, raw: any) => {
      }, (json: any) => {
        ReactGA.event({
          category: 'Error',
          action: 'Error connecting quest file to Fabricate.IO on publish',
          label: quest.id,
        });
        console.log('Error connecting quest file to Fabricate.IO on publish', json);
      });
    }).fail((error: {statusText: string, status: string, responseText: string}) => {
      dispatch(pushHTTPError(error));
    });
  }
}

export function saveQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'REQUEST_QUEST_SAVE', quest} as RequestQuestSaveAction);

    const notesCommented = '\n\n// QUEST NOTES\n// ' + quest.notesRealtime.getText().replace(/\n/g, '\n// ');
    const text: string = quest.mdRealtime.getText() + notesCommented;

    const xmlResult = renderXML(text);
    dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});

    const meta = xmlResult.getMeta();
    // For all metadata values, see https://developers.google.com/drive/v2/reference/files
    const fileMeta = {
      title: meta['title'] + '.quest',
      description: meta['summary'],
    };

    if (quest.id === undefined) {
      throw new Error('Undefined quest ID');
    }
    updateDriveFile(quest.id, fileMeta, text, function(err, result) {
      if (err) {
        ReactGA.event({
          category: 'Error',
          action: 'Error saving quest',
          label: quest.id,
        });
        dispatch({type: 'RECEIVE_QUEST_SAVE_ERR', err: err.message} as ReceiveQuestSaveErrAction);
      } else {
        ReactGA.event({
          category: 'Background',
          action: 'Quest Save',
        });
        dispatch({type: 'RECEIVE_QUEST_SAVE', meta} as ReceiveQuestSaveAction);
      }
    });
  };
}

export function unpublishQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'REQUEST_QUEST_UNPUBLISH', quest} as RequestQuestUnpublishAction);
    return $.post(API_HOST + '/unpublish/' + quest.id, function(resultQuestId: string) {
      quest.published = undefined;
      dispatch({type: 'RECEIVE_QUEST_UNPUBLISH', quest} as ReceiveQuestUnpublishAction);
      dispatch(setSnackbar(true, 'Quest un-published successfully!'));
    }).fail((error: {statusText: string, status: string, responseText: string}) => {
      dispatch(pushHTTPError(error));
    });
  };
}
