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
    allowNull: false,
    extra: 'BIGINT',
    primaryKey: true,
  }) public session: number;

  @field({
    allowNull: false,
    primaryKey: true,
  }) public timestamp: Date;

  @field({
    allowNull: false,
    default: '',
    maxLength: 255,
  }) public client: string;

  @field({
    allowNull: false,
    default: '',
    maxLength: 255,
  }) public instance: string;

  @field({
    allowNull: false,
    default: 0,
    extra: 'BIGINT',
  }) public id: number;

  @field({
    allowNull: false,
    default: '',
    maxLength: 32,
  }) public type: string;

  @field({
    default: '',
  }) public json: string;
}
