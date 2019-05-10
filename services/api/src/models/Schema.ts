import * as Sequelize from 'sequelize';
import { NOW, PLACEHOLDER_DATE, SchemaBase } from 'shared/schema/SchemaBase';

export function toSequelize(s: SchemaBase) {
  const result: Sequelize.ModelAttributes = {};
  for (const k of Object.keys(s.optionsMap)) {
    const m = s.optionsMap[k];
    let type: Sequelize.DataType;
    switch (m.type) {
      case 'String':
        if (m.maxLength === undefined) {
          type = Sequelize.TEXT;
        } else {
          type = Sequelize.STRING(m.maxLength);
        }
        break;
      case 'Date':
      case 'Object':
        // !!!!!!!!!!!!!!!! WARNING !!!!!!!!!!!!!!!
        // This works for now - we don't include any other non-primitive data types
        // than Date in our SQL code presently.
        // Reflection on the Date type and other types is broken
        // in ts-jest, so we must also filter on 'Object' for testing.
        // https://github.com/kulshekhar/ts-jest/issues/439
        type = Sequelize.DATE;
        break;
      case 'Boolean':
        type = Sequelize.BOOLEAN;
        break;
      case 'Number':
        type = Sequelize.INTEGER;
        break;
      default:
        throw new Error(
          'Could not map field ' +
            k +
            ' (type ' +
            (m.type || '').toString() +
            ') to Sequelize type',
        );
    }
    if (m.extra === 'DECIMAL_4_2') {
      type = Sequelize.DECIMAL(4, 2);
    } else if (m.extra === 'BIGINT') {
      type = Sequelize.BIGINT;
    }
    const r: Sequelize.ModelAttributeColumnOptions = { type };
    if (m.column !== undefined) {
      r.field = m.column;
    }
    if (m.primaryKey !== undefined) {
      r.primaryKey = m.primaryKey;
    }
    if (m.allowNull !== undefined) {
      r.allowNull = m.allowNull;
    }
    if (m.default !== undefined) {
      if (type === Sequelize.DATE) {
        if (m.default === PLACEHOLDER_DATE) {
          r.defaultValue = null;
        } else if (m.default === NOW) {
          r.defaultValue = Sequelize.NOW;
        } else {
          r.defaultValue = m.default;
        }
      } else {
        r.defaultValue = m.default;
      }
    }
    result[k] = r;
  }
  return result;
}

export function prepare<T extends SchemaBase>(s: T): T {
  const result: any = {};
  const keys = Object.keys(s);
  for (const k of keys) {
    // Swap out placeholders for nulls
    if ((s as any)[k] === PLACEHOLDER_DATE) {
      result[k] = null;
    } else {
      result[k] = (s as any)[k];
    }
  }
  return result;
}
