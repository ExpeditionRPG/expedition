import {SchemaBase, field, NOW} from '@expedition-qdl/schema/SchemaBase'
import {toSequelize} from './Schema'
import Sequelize from 'sequelize'

class Example extends SchemaBase {
  static create(fields: Partial<Example>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Example>) {
    super(fields);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) requiredStringPkey: string;

  @field({
    maxLength: 255,
    default: '',
  }) defaultEmptyString: string;

  @field({
    default: 0,
    column: 'column_name',
  }) remappedNumber: number;

  @field({
    default: NOW,
  }) nowDate: Date;

  @field({
  }) emptyDate: Date;
}

describe('Schema', () => {
  describe('toSequelize', () => {
    it('constructs a sequelize model definition', () => {
      expect(toSequelize(new Example({requiredStringPkey: '', emptyDate: new Date()}))).toEqual({
        'defaultEmptyString': {
          'defaultValue': '',
          'type': {
            '_binary': undefined,
            '_length': 255,
            'options': {
              'binary': undefined,
              'length': 255
            },
          }
        },
        'emptyDate': {
          'type': Sequelize.DATE,
        },
        'nowDate': {
          'defaultValue': '_now',
          'type': Sequelize.DATE,
        },
        'remappedNumber': {
          'defaultValue': 0,
          'field': 'column_name',
          'type': Sequelize.INTEGER,
        },
        'requiredStringPkey': {
          'allowNull': false, 'primaryKey': true,
          'type': {
            '_binary': undefined,
            '_length': 255,
            'options': {
              'binary': undefined,
              'length': 255,
            }
          }
        }
      } as any);
    });
  });
});
