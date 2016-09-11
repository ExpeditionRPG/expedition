/// <reference path="../typings/redux/redux.d.ts" />
/// <reference path="../typings/redux-thunk/redux-thunk.d.ts" />
/// <reference path="../typings/react-redux/react-redux.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
/// <reference path="../typings/material-ui/material-ui.d.ts" />
/// <reference path="../typings/react-tap-event-plugin/react-tap-event-plugin.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-shim/es6-shim.d.ts" />

/// <reference path="../typings/custom/require.d.ts" />
/// <reference path="../typings/custom/react-ace.d.ts" />
/// <reference path="../typings/custom/brace.d.ts" />

/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/expect/expect.d.ts" />

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