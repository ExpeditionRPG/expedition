import {DIFFICULTIES} from './Constants';
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
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
    column: 'user_id',
  }) public userID: string;

  @field({
    primaryKey: true,
    default: NOW,
  }) public created: Date;

  @field({
    maxLength: 255,
    default: '',
    allowNull: false,
  }) public category: string;

  @field({
    maxLength: 255,
    default: '',
    allowNull: false,
  }) public action: string;

  @field({
    default: '',
    maxLength: 255,
    column: 'quest_id',
  }) public questID: string;

  @field({
    default: 1,
    column: 'quest_version',
  }) public questVersion: number;

  @field({
    maxLength: 32,
    default: '',
    valid: [...DIFFICULTIES, ''],
  }) public difficulty: string;

  @field({
    maxLength: 32,
    default: '',
  }) public platform: string;

  @field({
    default: 0,
  }) public players: number;

  @field({
    maxLength: 32,
    default: '',
  }) public version: string;

  @field({
    default: '',
  }) public json: string;
}
