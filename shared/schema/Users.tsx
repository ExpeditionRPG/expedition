import {copyAndUnsetDefaults, field, NOW, PLACEHOLDER_DATE, SchemaBase} from './SchemaBase';

export class User extends SchemaBase {
  public static create(fields: Partial<User>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<User>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(User, this);
  }

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  }) public id: string;

  @field({
    default: '',
    maxLength: 255,
  }) public email: string;

  @field({
    default: '',
    maxLength: 255,
  }) public name: string;

  @field({
    column: 'loot_points',
    default: 0,
  }) public lootPoints: number;

  @field({
    default: NOW,
  }) public created: Date;

  @field({
    column: 'login_count',
    default: 0,
  }) public loginCount: number;

  @field({
    column: 'last_login',
    default: PLACEHOLDER_DATE,
  }) public lastLogin: Date;
}
