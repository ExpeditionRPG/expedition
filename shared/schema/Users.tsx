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
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) public id: string;

  @field({
    maxLength: 255,
    default: '',
  }) public email: string;

  @field({
    maxLength: 255,
    default: '',
  }) public name: string;

  @field({
    default: 0,
    column: 'loot_points',
  }) public lootPoints: number;

  @field({
    default: NOW,
  }) public created: Date;

  @field({
    default: 0,
    column: 'login_count',
  }) public loginCount: number;

  @field({
    default: PLACEHOLDER_DATE,
    column: 'last_login',
  }) public lastLogin: Date;
}
