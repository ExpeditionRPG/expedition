import {SchemaBase, field, copyAndUnsetDefaults} from '../SchemaBase'

export class Event extends SchemaBase {
  static create(fields: Partial<Event>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Event>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(Event, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    extra: 'BIGINT',
  }) session: number;

  @field({
    primaryKey: true,
    allowNull: false,
  }) timestamp: Date;

  @field({
    allowNull: false,
    maxLength: 255,
    default: '',
  }) client: string;

  @field({
    allowNull: false,
    maxLength: 255,
    default: '',
  }) instance: string;

  @field({
    allowNull: false,
    extra: 'BIGINT',
    default: 0,
  }) id: number;

  @field({
    maxLength: 32,
    default: '',
    allowNull: false,
  }) type: string;

  @field({
    default: '',
  }) json: string;
}
