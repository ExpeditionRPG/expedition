import {SchemaBase, field, copyAndUnsetDefaults} from './SchemaBase'
import {PARTITIONS} from './Constants'

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
    valid: [PARTITIONS],
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
