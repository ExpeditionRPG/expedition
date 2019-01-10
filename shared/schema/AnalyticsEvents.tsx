import {Difficulty, enumValues} from './Constants';
import {copyAndUnsetDefaults, field, NOW, SchemaBase} from './SchemaBase';

export class AnalyticsEvent extends SchemaBase {
  public static create(fields: Partial<AnalyticsEvent>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<AnalyticsEvent>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(AnalyticsEvent, this);
  }

  @field({
    allowNull: false,
    column: 'user_id',
    maxLength: 255,
    primaryKey: true,
  }) public userID: string;

  @field({
    default: NOW,
    primaryKey: true,
  }) public created: Date;

  @field({
    allowNull: false,
    default: '',
    maxLength: 255,
  }) public category: string;

  @field({
    allowNull: false,
    default: '',
    maxLength: 255,
  }) public action: string;

  @field({
    column: 'quest_id',
    default: '',
    maxLength: 255,
  }) public questID: string;

  @field({
    column: 'quest_version',
    default: 1,
  }) public questVersion: number;

  @field({
    default: '',
    maxLength: 32,
    valid: [...enumValues(Difficulty), ''],
  }) public difficulty: string;

  @field({
    default: '',
    maxLength: 32,
  }) public platform: string;

  @field({
    default: 0,
  }) public players: number;

  @field({
    default: '',
    maxLength: 32,
  }) public version: string;

  @field({
    default: '',
  }) public json: string;
}
