import Redux from 'redux'
import {
  NEW_QUEST, LOAD_QUEST, SAVE_QUEST,
  ReceiveQuestLoadAction,
  RequestQuestSaveAction, ReceiveQuestSaveAction, ReceiveQuestSaveErrAction,
  RequestQuestPublishAction, ReceiveQuestPublishAction,
  RequestQuestUnpublishAction, ReceiveQuestUnpublishAction,
} from './ActionTypes'
import {QuestType, ShareType} from '../reducers/StateTypes'

import {setDialog} from './dialogs'
import {realtimeUtils} from '../auth'
import {
  NEW_QUEST_TEMPLATE,
  QUEST_DOCUMENT_HEADER,
  NEW_QUEST_AUTHOR,
  NEW_QUEST_EMAIL,
  NEW_QUEST_SUMMARY,
  NEW_QUEST_TITLE,
  NEW_QUEST_URL
} from '../constants'
import {pushError, pushHTTPError} from '../error'
import {renderXML} from '../parsing/QDLParser'

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

export function loadQuestFromURL(userid: string, dispatch: Redux.Dispatch<any>) {
  loadQuest(userid, dispatch, (window.location.hash) ? window.location.hash.substr(1) : null);
}


export function newQuest(userid: string, dispatch: any) {
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
        loadQuest(userid, dispatch, createResponse.id);
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

export function loadQuest(userid: string, dispatch: any, docid?: string) {
  if (docid === null) {
    console.log('Creating new quest');
    return newQuest(userid, dispatch);
  }
  realtimeUtils.load(docid, function(doc: any) {
    window.location.hash=docid;
    var md = doc.getModel().getRoot().get('markdown');
    var notes = doc.getModel().getRoot().get('notes');
    if (!notes) {
      // Older quests may not have had the notes attribute.
      // We create it here if so.
      notes = createDocNotes(doc.getModel());
    }
    var text: string = md.getText();
    getPublishedQuestMeta(userid + '_' + docid, function(quest: QuestType) {
      var xmlResult = renderXML(text);
      quest = Object.assign(quest || {}, xmlResult.getMeta());
      quest.id = docid;
      quest.mdRealtime = md;
      quest.notesRealtime = notes;
      dispatch(receiveQuestLoad(quest));
      dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});
    });
  },
  function(model: any) {
    var string = model.createString();
    string.setText(NEW_QUEST_TEMPLATE);
    model.getRoot().set('markdown', string);
    createDocNotes(model);
  });
}

export function publishQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const text = quest.mdRealtime.getText();
    const xmlResult = renderXML(text);
    const meta = xmlResult.getMeta();
    const metaDefaults: any = {
      author: NEW_QUEST_AUTHOR,
      email: NEW_QUEST_EMAIL,
      summary: NEW_QUEST_SUMMARY,
      title: NEW_QUEST_TITLE,
      url: NEW_QUEST_URL,
    };
    let metaNoDefaults = true;
    $.each(metaDefaults, (key, value) => {
      if (meta[key] === metaDefaults[key]) {
        metaNoDefaults = false;
        pushError(new Error(`Quest ${key} must be changed from default before you can publish.`));
      }
    });

    if (metaNoDefaults) {
      dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});
      dispatch({type: 'REQUEST_QUEST_PUBLISH', quest} as RequestQuestPublishAction);
      return $.ajax({
        type: 'POST',
        url: '/publish/' + quest.id,
        data: xmlResult.getResult()+'',
      }).done((result_quest_id: string) => {
        quest.published = (new Date(Date.now()).toISOString());
        dispatch({type: 'RECEIVE_QUEST_PUBLISH', quest} as ReceiveQuestPublishAction);
      }).fail(pushHTTPError);
    }
  }
}

export function saveQuest(quest: QuestType): ((dispatch: Redux.Dispatch<any>)=>any) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch({type: 'REQUEST_QUEST_SAVE', quest} as RequestQuestSaveAction);

    let notesCommented = '\n\n// QUEST NOTES\n// ' + quest.notesRealtime.getText().replace(/\n/g, '\n// ');
    let text: string = quest.mdRealtime.getText() + notesCommented;

    var xmlResult = renderXML(text);
    dispatch({type: 'QUEST_RENDER', qdl: xmlResult, msgs: xmlResult.getFinalizedLogs()});

    var meta = xmlResult.getMeta();
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
