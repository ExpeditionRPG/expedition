import {SchemaBase, field, copyAndUnsetDefaults} from '../SchemaBase'

export class SessionClient extends SchemaBase {
  static create(fields: Partial<SessionClient>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<SessionClient>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(SessionClient, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    extra: 'BIGINT',
  }) session: number;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) client: string;

  @field({
    allowNull: false,
    maxLength: 32,
    default: '',
  }) secret: string;
}
