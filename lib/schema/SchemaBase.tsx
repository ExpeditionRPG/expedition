import 'reflect-metadata'

// Regular 'joi' includes ES2015 concepts, which causes PhantomJS
// browser to fail to parse it. The Joi library is also much heavier
// than joi-browser, which is designed to run on a browser (and not just NodeJS).
// TODO(scott): Figure out a way to type this
const Joi: any = require('joi-browser');

interface SchemaOptions {
  type: string;
  primaryKey: boolean;
  allowNull: boolean;

  default: any;
  valid: any[];
  maxLength: number;
}

// Create custom types here to annotate abnormal data formats (e.g. sql DECIMAL(4,2))
export type Decimal4_2 = number;
export type Email = string;

export const NOW = '_now';

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
    for (const k of validKeys) {
      const defaultValue = this.optionsMap[k].default;
      if (keys.indexOf(k) === -1 && defaultValue !== undefined) {
        if (defaultValue === NOW) {
          parsedFields[k] = new Date();
        } else {
          parsedFields[k] = this.optionsMap[k].default;
        }
        this.setDefaults.push(k);
      }
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
        return Joi.string();
      case 'Number': 
        return Joi.number();
      case 'Array': 
        return Joi.array();
      case 'Email':
        return Joi.string().email();
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
      if (m.valid !== undefined) {
        j = j.valid(m.valid);
      }
      if (m.maxLength !== undefined) {
        j = (j as any).max(m.maxLength);
      }
      if (m.default !== undefined) {
        j = j.default(m.default);
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
