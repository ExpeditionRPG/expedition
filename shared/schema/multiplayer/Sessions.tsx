import {copyAndUnsetDefaults, field, SchemaBase} from '../SchemaBase';

export class Session extends SchemaBase {
  public static create(fields: Partial<Session>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Session>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(Session, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    extra: 'BIGINT',
  }) public id: number;

  @field({
    allowNull: false,
    maxLength: 32,
    default: '',
  }) public secret: string;

  @field({
    allowNull: false,
    default: 0,
    column: 'eventcounter',
  }) public eventCounter: number;

  @field({
    allowNull: false,
    default: false,
  }) public locked: boolean;
}
