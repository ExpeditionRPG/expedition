import {copyAndUnsetDefaults, field, SchemaBase} from '../SchemaBase';

export class SessionClient extends SchemaBase {
  public static create(fields: Partial<SessionClient>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<SessionClient>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(SessionClient, this);
  }

  @field({
    allowNull: false,
    extra: 'BIGINT',
    primaryKey: true,
  }) public session: number;

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  }) public client: string;

  @field({
    allowNull: false,
    default: '',
    maxLength: 32,
  }) public secret: string;
}
