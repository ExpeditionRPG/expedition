import {copyAndUnsetDefaults, field, SchemaBase} from '../SchemaBase';

export class Event extends SchemaBase {
  public static create(fields: Partial<Event>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Event>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(Event, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    extra: 'BIGINT',
  }) public session: number;

  @field({
    primaryKey: true,
    allowNull: false,
  }) public timestamp: Date;

  @field({
    allowNull: false,
    maxLength: 255,
    default: '',
  }) public client: string;

  @field({
    allowNull: false,
    maxLength: 255,
    default: '',
  }) public instance: string;

  @field({
    allowNull: false,
    extra: 'BIGINT',
    default: 0,
  }) public id: number;

  @field({
    maxLength: 32,
    default: '',
    allowNull: false,
  }) public type: string;

  @field({
    default: '',
  }) public json: string;
}
