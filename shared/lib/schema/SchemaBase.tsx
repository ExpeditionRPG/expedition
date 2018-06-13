import 'reflect-metadata'

// Regular 'joi' includes ES2015 concepts, which causes PhantomJS
// browser to fail to parse it. The Joi library is also much heavier
// than joi-browser, which is designed to run on a browser (and not just NodeJS).
// TODO(scott): Figure out a way to type this
const Joi: any = require('joi-browser');

export const NOW = '_now';
export const PLACEHOLDER_DATE = new Date(0);
export type ExtraTypeQualifier = 'DECIMAL_4_2'|'BIGINT';

export interface SchemaOptions {
  type: string;
  primaryKey: boolean;
  allowNull: boolean;
  column: string;

  default: any;
  valid: any[];
  maxLength: number;
  extra: ExtraTypeQualifier;
}

// Use @field to annotate parameters in a class that extends SchemaBase.
export function field(options: Partial<SchemaOptions>) {
  function actualDecorator(target: SchemaBase, property: string | symbol): void {
    if (typeof(property) !== 'string') {
      throw new Error('@field decorator not valid on non-value properties');
    }
    const t = Reflect.getMetadata('design:type', target, property);
    if (target.optionsMap === undefined) {
      target.optionsMap = {};
    }
    target.optionsMap[property] = {...options, type: t.name};
  }
  return actualDecorator;
}

export function copyAndUnsetDefaults<T extends SchemaBase>(cls: any, obj: T): Partial<T> {
  const result: any = new cls(obj);
  for (const k of obj.setDefaults) {
    result[k] = undefined;
  }
  return result;
}

export class SchemaBase {
  public optionsMap: {[key: string]: Partial<SchemaOptions>};
  public setDefaults: string[];

  constructor(fields: any) {
    this.setDefaults = [];
    const keys = Object.keys(fields);
    const validKeys = Object.keys(this.optionsMap);

    const parsedFields: any = {};
    for (const k of keys) {
      if (validKeys.indexOf(k) === -1) {
        continue;
      }
      parsedFields[k] = fields[k]
    }

    const missingFields: string[] = [];
    for (const k of validKeys) {
      const defaultValue = this.optionsMap[k].default;
      const needsDefault = (keys.indexOf(k) === -1 || parsedFields[k] === null || parsedFields[k] === undefined);
      if (needsDefault && defaultValue !== undefined) {
        if (defaultValue === NOW) {
          parsedFields[k] = new Date();
        } else {
          parsedFields[k] = defaultValue;
        }
        this.setDefaults.push(k);
      } else if (needsDefault && this.optionsMap[k].allowNull) {
        parsedFields[k] = null;
      }

      if (parsedFields[k] === undefined) {
        missingFields.push(k);
      }
    }

    if (missingFields.length > 0) {
      throw new Error('Missing fields: ' + JSON.stringify(missingFields));
    }

    this.getJoiValidationParams();
    const result = Joi.validate(parsedFields, this.getJoiValidationParams());
    if (result.error !== null) {
      throw result.error;
    }

    for (const k of Object.keys(result.value)) {
      (this as any)[k] = result.value[k];
    }
  }

  private joiType(o: Partial<SchemaOptions>) {
    switch (o.type) {
      case 'Boolean':
        return Joi.boolean();
      case 'String':
        return Joi.string().allow('');
      case 'Number':
        return Joi.number();
      case 'Array':
        return Joi.array();
      case 'Date':
        return Joi.date();
      default:
        return Joi.any();
    }
  }

  private getJoiValidationParams() {
    const keys: {[property:string]: any} = {};

    for (const k of Object.keys(this.optionsMap)) {
      const m = this.optionsMap[k];
      let j = this.joiType(m);
      if (m.allowNull !== undefined && m.allowNull === true) {
        j = j.allow(null);
      }
      if (m.valid !== undefined) {
        j = j.valid(m.valid);
      }
      if (m.maxLength !== undefined) {
        j = (j as any).max(m.maxLength);
      }
      keys[k] = j;
    }
    return Joi.object().keys(keys);
  }

  public static initialize<T>(cls: any, fields: Partial<T>): T|Error {
    try {
      return new cls(fields);
    } catch(e) {
      return e;
    }
  }
}
