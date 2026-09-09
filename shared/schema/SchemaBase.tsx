// joi-browser was a 2018 fork of joi 13 packaged for the browser; joi itself
// has shipped a `browser` entry (dist/joi-browser.min.js) since v16, which
// webpack resolves for the four browser bundles, so the fork is gone and this
// is the real, typed package.
import * as Joi from 'joi';
import 'reflect-metadata';

export const NOW = '_now';
export const PLACEHOLDER_DATE = new Date(0);
export type ExtraTypeQualifier = 'DECIMAL_4_2' | 'BIGINT';

export interface SchemaOptions {
  allowNull: boolean;
  column: string;
  default: any;
  extra: ExtraTypeQualifier;
  maxLength: number;
  primaryKey: boolean;
  type: string;
  valid: any[];
}

// Use @field to annotate parameters in a class that extends SchemaBase.
export function field(options: Partial<SchemaOptions>) {
  function actualDecorator(
    target: SchemaBase,
    property: string | symbol,
  ): void {
    if (typeof property !== 'string') {
      throw new Error('@field decorator not valid on non-value properties');
    }
    const t = Reflect.getMetadata('design:type', target, property);
    if (target.optionsMap === undefined) {
      target.optionsMap = {};
    }
    target.optionsMap[property] = { ...options, type: t.name };
  }
  return actualDecorator;
}

export function copyAndUnsetDefaults<T extends SchemaBase>(
  cls: any,
  obj: T,
): Partial<T> {
  const result: any = new cls(obj);
  for (const k of obj.setDefaults) {
    result[k] = undefined;
  }
  return result;
}

export class SchemaBase {
  public optionsMap!: { [key: string]: Partial<SchemaOptions> };
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
      parsedFields[k] = fields[k];
    }

    const missingFields: string[] = [];
    for (const k of validKeys) {
      const defaultValue = this.optionsMap[k].default;
      const needsDefault =
        keys.indexOf(k) === -1 ||
        parsedFields[k] === null ||
        parsedFields[k] === undefined;
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

    // joi 16 removed the free `Joi.validate(value, schema)` function in favour
    // of `schema.validate(value)`, and a passing validation now reports
    // `error: undefined` rather than `error: null` -- so this has to test
    // truthiness, not `!== null`.
    const result = this.getJoiValidationParams().validate(parsedFields);
    if (result.error) {
      throw result.error;
    }

    for (const k of Object.keys(result.value)) {
      (this as any)[k] = result.value[k];
    }
  }

  private joiType(o: Partial<SchemaOptions>): Joi.Schema {
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

  private getJoiValidationParams(): Joi.ObjectSchema {
    const keys: Joi.SchemaMap = {};

    for (const k of Object.keys(this.optionsMap)) {
      const m = this.optionsMap[k];
      let j: Joi.Schema = this.joiType(m);
      if (m.allowNull !== undefined && m.allowNull === true) {
        j = j.allow(null);
      }
      if (m.valid !== undefined) {
        // joi 13 took a single array and deep-flattened it (Hoek.flatten);
        // joi 16+ takes varargs and treats an array argument as one literal
        // allowed value, so the list has to be spread.
        j = j.valid(...m.valid);
      }
      if (m.maxLength !== undefined) {
        // `max` is declared on the string/number/array/date schemas but not on
        // `any` or `boolean`; a field that sets maxLength on one of those was
        // already a schema-construction error under joi 13.
        if (!('max' in j)) {
          throw new Error(
            `maxLength is not meaningful for ${m.type} field '${k}'`,
          );
        }
        j = j.max(m.maxLength);
      }
      keys[k] = j;
    }
    return Joi.object().keys(keys);
  }

  public static initialize<T>(cls: any, fields: Partial<T>): T | Error {
    try {
      return new cls(fields);
    } catch (e) {
      return e instanceof Error ? e : new Error(String(e));
    }
  }
}
