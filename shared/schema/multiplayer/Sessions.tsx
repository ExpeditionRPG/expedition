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
    allowNull: false,
    extra: 'BIGINT',
    primaryKey: true,
  }) public id: number;

  @field({
    allowNull: false,
    default: '',
    maxLength: 32,
  }) public secret: string;

  @field({
    allowNull: false,
    column: 'eventcounter',
    default: 0,
  }) public eventCounter: number;

  @field({
    allowNull: false,
    default: false,
  }) public locked: boolean;
}
