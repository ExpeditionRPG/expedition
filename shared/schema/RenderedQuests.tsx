import {PARTITIONS} from './Constants';
import {copyAndUnsetDefaults, field, SchemaBase} from './SchemaBase';

export class RenderedQuest extends SchemaBase {
  public static create(fields: Partial<RenderedQuest>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<RenderedQuest>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(RenderedQuest, this);
  }

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 32,
    valid: [PARTITIONS],
  }) public partition: string;

  @field({
    primaryKey: true,
    allowNull: false,
    maxLength: 255,
  }) public id: string;

  @field({
    primaryKey: true,
    default: 1,
  }) public questversion: number;

  @field({
    default: '',
  }) public xml: string;
}
