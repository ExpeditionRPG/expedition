import {SchemaBase, field, copyAndUnsetDefaults} from './SchemaBase'
import {PRIVATE_PARTITION, PUBLIC_PARTITION} from './Quests'

export class RenderedQuest extends SchemaBase {
  static create(fields: Partial<RenderedQuest>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<RenderedQuest>) {
    super(fields);
  }

  withoutDefaults() {
    return copyAndUnsetDefaults(RenderedQuest, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 32,
    valid: [PRIVATE_PARTITION, PUBLIC_PARTITION],
  }) partition: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) id: string;

  @field({
    primaryKey: true,
    default: 1,
  }) questversion: number;

  @field({
    default: '',
  }) xml: string;
}
