// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

describe('reducers', () => {
  require('../app/reducers/dialogs.test');
  require('../app/reducers/dirty.test');
  require('../app/reducers/drawer.test');
  require('../app/reducers/editor.test');
  require('../app/reducers/errors.test');
  require('../app/reducers/quest.test');
  require('../app/reducers/user.test');
});

describe('actions', () => {
  require('../app/actions/dialog.test');
  require('../app/actions/drawer.test');
  require('../app/actions/editor.test');
  require('../app/actions/quest.test');
  require('../app/actions/user.test');
})

// TODO: Test base components once they're well defined

describe('components', () => {
  require('../app/components/Dialogs.test');
  require('../app/components/QuestAppBar.test');
  require('../app/components/QuestIDE.test');
  require('../app/components/QuestList.test');
})

describe('component containers', () => {
  require('../app/components/DialogsContainer.test')
  require('../app/components/QuestAppBarContainer.test')
  require('../app/components/QuestIDEContainer.test')
  require('../app/components/QuestListContainer.test')
})

/*

var config = require('./config');
var utils = require('nodejs-repo-tools');

describe(config.test + '/', function () {
  var topicName;

  before(function () {
    var appConfig = require('../config');
    topicName = appConfig.get('TOPIC_NAME');
    appConfig.set('TOPIC_NAME', topicName + '-' + config.test);
  });

  if (!process.env.E2E_TESTS) {
    it('should install dependencies', function (done) {
      this.timeout(120 * 1000); // Allow 2 minutes to test installation
      utils.testInstallation(config, done);
    });
  }



  require('./app.test');
  describe('books/', function () {
    var appConfig = require('../config');
    var DATA_BACKEND = appConfig.get('DATA_BACKEND');
    if (DATA_BACKEND === 'datastore' || process.env.TEST_DATASTORE) {
      require('./api.test')('datastore');
      require('./crud.test')('datastore');
    }
    if (DATA_BACKEND === 'cloudsql' || process.env.TEST_CLOUDSQL) {
      require('./api.test')('cloudsql');
      require('./crud.test')('cloudsql');
    }
    if (DATA_BACKEND === 'mongodb' || process.env.TEST_MONGODB) {
      require('./api.test')('mongodb');
      require('./crud.test')('mongodb');
    }
  });
  if (!process.env.E2E_TESTS) {
    describe('lib/', function () {
      require('./background.test');
      require('./oauth2.test');
    });
  }


  afterEach(function () {
    var appConfig = require('../config');
    appConfig.set('TOPIC_NAME', topicName);
  });

});
*/