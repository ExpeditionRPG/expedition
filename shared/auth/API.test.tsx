import {registerUserAndIdToken} from './API'
import {TEST_USER_STATE}  from './TestData'
const fetchMock = require('fetch-mock');
const nodeFetch = require('node-fetch');
nodeFetch.default = fetchMock;

describe('registerUserAndIdToken', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  test('POSTs user data and includes response', (done) => {
    const want = {
      lastLogin: new Date(),
      loginCount: 5,
      lootPoints: 10,
    };
    fetchMock.post(/.*/, want);
    registerUserAndIdToken("asdf", TEST_USER_STATE).then((r) => {
      expect(r).toEqual(jasmine.objectContaining(want));
      done()
    }).catch(done.fail);
  });
});
