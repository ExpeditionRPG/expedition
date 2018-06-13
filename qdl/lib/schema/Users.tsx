import {SchemaBase, field, copyAndUnsetDefaults, NOW, PLACEHOLDER_DATE} from './SchemaBase'

export class User extends SchemaBase {
  static create(fields: Partial<User>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<User>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(User, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) id: string;

  @field({
    maxLength: 255,
    default: '',
  }) email: string;

  @field({
    maxLength: 255,
    default: '',
  }) name: string;

  @field({
    default: 0,
    column: 'loot_points',
  }) lootPoints: number;

  @field({
    default: NOW,
  }) created: Date

  @field({
    default: 0,
    column: 'login_count',
  }) loginCount: number;

  @field({
    default: PLACEHOLDER_DATE,
    column: 'last_login',
  }) lastLogin: Date
}
