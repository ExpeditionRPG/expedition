import {ErrorType} from './types';

import * as e411 from './definitions/411';
import * as e412 from './definitions/412';
import * as e413 from './definitions/413';
import * as e414 from './definitions/414';
import * as e416 from './definitions/416';
import * as e417 from './definitions/417';
import * as e418 from './definitions/418';
import * as e419 from './definitions/419';
import * as e420 from './definitions/420';
import * as e421 from './definitions/421';
import * as e423 from './definitions/423';
import * as e428 from './definitions/428';
import * as e429 from './definitions/429';
import * as e430 from './definitions/430';
import * as e431 from './definitions/431';
import * as e432 from './definitions/432';
import * as e433 from './definitions/433';
import * as e434 from './definitions/434';
import * as e435 from './definitions/435';
import * as e436 from './definitions/436';
import * as e437 from './definitions/437';

const errors: {[id: string]: ErrorType} = {
  411: e411,
  412: e412,
  413: e413,
  414: e414,
  416: e416,
  417: e417,
  418: e418,
  419: e419,
  420: e420,
  421: e421,
  423: e423,
  428: e428,
  429: e429,
  430: e430,
  431: e431,
  432: e432,
  433: e433,
  434: e434,
  435: e435,
  436: e436,
  437: e437,
};

// TODO(scott): Bulk-rename all this to "annotation" instead of "error"
export default errors;
