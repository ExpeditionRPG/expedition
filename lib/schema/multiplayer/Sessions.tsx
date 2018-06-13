import {SchemaBase, field, copyAndUnsetDefaults} from '../SchemaBase'

export class Session extends SchemaBase {
  static create(fields: Partial<Session>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<Session>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(Session, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    extra: 'BIGINT',
  }) id: number;

  @field({
    allowNull: false,
    maxLength: 32,
    default: '',
  }) secret: string;

  @field({
    allowNull: false,
    default: 0,
    column: 'eventcounter',
  }) eventCounter: number;

  @field({
    allowNull: false,
    default: false,
  }) locked: boolean;
}
