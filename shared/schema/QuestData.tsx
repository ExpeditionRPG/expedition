import {copyAndUnsetDefaults, field, NOW, PLACEHOLDER_DATE, SchemaBase} from './SchemaBase';

export class QuestData extends SchemaBase {
  public static create(fields: Partial<QuestData>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<QuestData>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(QuestData, this);
  }

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  }) public id: string;

  @field({
    default: '',
    maxLength: 255,
    primaryKey: true,
  }) public userid: string;

  @field({
    default: NOW,
    primaryKey: true,
  }) public created: Date;

  @field({
  }) public data: string;

  @field({
  }) public notes: string;

  @field({
  }) public metadata: string;

  // Used to determine which of multiple clients is the "master" edit session.
  @field({
    allowNull: false,
  }) public edittime: Date;

  @field({
    allowNull: true,
    default: PLACEHOLDER_DATE,
  }) public tombstone: Date;
}
