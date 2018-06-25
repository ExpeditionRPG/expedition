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
    primaryKey: true,
    allowNull: false,
    extra: 'BIGINT',
  }) public session: number;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) public client: string;

  @field({
    allowNull: false,
    maxLength: 32,
    default: '',
  }) public secret: string;
}
