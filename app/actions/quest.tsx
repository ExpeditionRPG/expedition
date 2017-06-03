import Redux from 'redux'
import {
  NEW_QUEST, LOAD_QUEST, SAVE_QUEST,
  ReceiveQuestLoadAction,
  RequestQuestSaveAction, ReceiveQuestSaveAction, ReceiveQuestSaveErrAction,
  QuestPublishingSetupAction, QuestMetadataChangeAction,
  RequestQuestPublishAction, ReceiveQuestPublishAction,
  RequestQuestUnpublishAction, ReceiveQuestUnpublishAction,
} from './ActionTypes'
import {setSnackbar} from './snackbar'
import {QuestType, UserState, ShareType} from '../reducers/StateTypes'

import {setDialog} from './dialogs'
import {realtimeUtils} from '../auth'
import {
  NEW_QUEST_TEMPLATE,
  QUEST_DOCUMENT_HEADER,
  METADATA_FIELDS,
  METADATA_DEFAULTS,
  NEW_QUEST_TITLE
} from '../constants'
import {pushError, pushHTTPError} from '../error'
import {renderXML} from '../parsing/QDLParser'

const Cheerio: any = require('cheerio');

// Loaded on index.html
declare var window: any;

function receiveQuestLoad(quest: QuestType): ReceiveQuestLoadAction {
  return {type: 'RECEIVE_QUEST_LOAD', quest};
}

function updateDriveFile(fileId: string, fileMetadata: any, text: string, callback: (err: any, result?: any) => any) {
  const boundary = '-------314159265358979323846';
  const delimiter = '\r\n--' + boundary + '\r\n';
  const close_delim = '\r\n--' + boundary + '--';

  text = QUEST_DOCUMENT_HEADER + text;
  var base64Data = btoa(text);
  var multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(fileMetadata) +
      delimiter +
      'Content-Type: text/plain\r\n' +
      'Content-Transfer-Encoding: base64\r\n' +
      '\r\n' +
      base64Data +
      close_delim;

  var request = window.gapi.client.request({
      'path': '/upload/drive/v2/files/' + fileId,
      'method': 'PUT',
      'params': {'uploadType': 'multipart', 'alt': 'json'},
      'headers': {
        'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody});
  request.then((json: any, raw: any) => {
    return callback(null, json);
  }, (json: any) => {
    return callback(json.result.error);
  });
}

export function loadQuestFromURL(user: UserState, dispatch: Redux.Dispatch<any>) {
  loadQuest(user, dispatch, (window.location.hash) ? window.location.hash.substr(1) : null);
}


export function newQuest(user: UserState, dispatch: any) {
  var insertHash = {
    'resource': {
      mimeType: 'text/plain',
      title: 'New Expedition Quest',
      description: 'Created with the Expedition Quest Creator',
    }
  };
  window.gapi.client.drive.files.insert(insertHash).execute(function(createResponse: {id: string}) {
    updateDriveFile(createResponse.id, {}, '', function(err, result) {
      if (err) {
        alert('Failed to create new quest: ' + err.message);
      } else {
        loadQuest(user, dispatch, createResponse.id);
      }
    });
  });
}

function getPublishedQuestMeta(published_id: string, cb: (meta: QuestType)=>any) {
  $.post('/quests', JSON.stringify({id: published_id}), function(result: any) {
    result = JSON.parse(result);
    if (result.error) {
      throw new Error(result.error);
    }

    cb(result.quests[0] as QuestType);
  });
}

function createDocNotes(model: any) {
  const string = model.createString();
  model.getRoot().set('notes', string);
  return string;
}

function createDocMetadata(model: any, defaults: any) {
  const map = model.createMap();
  Object.keys(defaults).forEach((key: string) => {
    const val = defaults[key];
    if (val) {
      map.set(key, val);
    }
  });
  model.getRoot().set('metadata', map);
  return map;
}

export function loadQuest(user: UserState, dispatch: any, docid?: string) {
  if (docid === null) {
    console.log('Creating new quest');
    return newQuest(user, dispatch);
  }
  realtimeUtils.load(docid, function(doc: any) {
    window.location.hash=docid;
    const md = doc.getModel().getRoot().get('markdown');
    let notes = doc.getModel().getRoot().get('notes');
    let metadata = doc.getModel().getRoot().get('metadata');

    if (!notes) { // Create notes if it's an old quest w/o notes attribute
      notes = createDocNotes(doc.getModel());
    }

    if (!metadata) { // Create metadata if it's an old quest w/o metadata attribute
      // Default to any metadata set in the markdown metadata (migrate from the old format)
      try {
        const oldMeta = renderXML(md.toString()).getMeta();
        const defaults = {
          ...METADATA_DEFAULTS,
          summary: '',
          author: user.displayName,
          email: user.email,
          ...oldMeta,
        };
        metadata = createDocMetadata(doc.getModel(), defaults);
      } catch(err) {
        alert('Error parsing metadata. Please check your quest for validation errors, then try reloading the page. If this error persists, please contact support: Expedition@Fabricate.io');
        console.log(err);
      }
    }

    const text: string = md.getText();
    getPublishedQuestMeta(docid, (quest: QuestType) => {
      const xmlResult = renderXML(text);
      quest = Object.assign(quest || {}, xmlResult.getMeta(), {
        id: docid,
        mdRealtime: md,
        notesRealtime: notes,
        metadataRealtime: metadata,
        summary: metadata.get('summary'),
        author: metadata.get('author'),
        email: metadata.get('email'),
        minplayers: metadata.get('minplayers'),
        maxplayers: metadata.get('maxplayers'),
        mintimeminutes: metadata.get('mintimeminutes'),
        maxtimeminutes: metadata.get('maxtimeminutes'),
        genre: metadata.get('genre'),
        contentrating: metadata.get('contentrating'),
      });
      dispatch(receiveQuestLoad(quest));
      dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});
    });
  },
  (model: any) => {
    const string = model.createString();
    string.setText(NEW_QUEST_TEMPLATE);
    model.getRoot().set('markdown', string);
    createDocNotes(model);
  });
}

export function questMetadataChange(quest: QuestType, key: string, value: any): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    quest.metadataRealtime.set(key, value);
    dispatch({type: 'QUEST_METADATA_CHANGE', key, value} as QuestMetadataChangeAction);
  }
}

export function publishQuestSetup(): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'QUEST_PUBLISHING_SETUP'} as QuestPublishingSetupAction);
  }
}

export function publishQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const renderResult = renderXML(quest.mdRealtime.getText());

    // Insert metadata back into the XML. Temporary patch until ALL client apps
    // are running a version that supports DB metadata
    // TODO https://github.com/ExpeditionRPG/expedition-quest-creator/issues/270
    const xml = Cheerio(renderResult.getResult()+'')
        .attr('summary', quest.summary)
        .attr('author', quest.author)
        .attr('email', quest.email)
        .attr('minplayers', quest.minplayers)
        .attr('maxplayers', quest.maxplayers)
        .attr('mintimeminutes', quest.mintimeminutes)
        .attr('maxtimeminutes', quest.maxtimeminutes)
        .attr('genre', quest.genre)
        .attr('contentrating', quest.contentrating);

    dispatch({type: 'QUEST_RENDER', qdl: renderResult, msgs: renderResult.getFinalizedLogs()});
    dispatch({type: 'REQUEST_QUEST_PUBLISH', quest} as RequestQuestPublishAction);
    return $.ajax({
      type: 'POST',
      url: '/publish/' + quest.id,
      data: xml.toString(),
    }).done((result_quest_id: string) => {
      quest.published = (new Date(Date.now()).toISOString());
      dispatch({type: 'RECEIVE_QUEST_PUBLISH', quest} as ReceiveQuestPublishAction);
      dispatch(setSnackbar(true, 'Quest published successfully!'));
    }).fail(pushHTTPError);
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
    var fileMeta = {
      title: meta['title'] + '.quest',
      description: meta['summary'],
    };

    updateDriveFile(quest.id, fileMeta, text, function(err, result) {
      if (err) {
        dispatch({type: 'RECEIVE_QUEST_SAVE_ERR', err: err.message} as ReceiveQuestSaveErrAction);
      } else {
        dispatch({type: 'RECEIVE_QUEST_SAVE', quest: meta} as ReceiveQuestSaveAction);
      }
    });
  };
}

export function unpublishQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'REQUEST_QUEST_UNPUBLISH', quest} as RequestQuestUnpublishAction);
    return $.post('/unpublish/' + quest.id, function(result_quest_id: string) {
      quest.published = undefined;
      dispatch({type: 'RECEIVE_QUEST_UNPUBLISH', quest} as ReceiveQuestUnpublishAction);
    }).fail(pushHTTPError);
  };
}
