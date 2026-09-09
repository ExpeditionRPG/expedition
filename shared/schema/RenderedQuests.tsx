import { enumValues, Partition } from './Constants';
import { copyAndUnsetDefaults, field, SchemaBase } from './SchemaBase';

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
    allowNull: false,
    maxLength: 32,
    primaryKey: true,
    // Un-nested: joi 13 deep-flattened the value list, joi 16+ does not, so a
    // nested array would make the array itself the one allowed value.
    valid: enumValues(Partition),
  })
  public partition!: string;

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  })
  public id!: string;

  @field({
    default: 1,
    primaryKey: true,
  })
  public questversion!: number;

  @field({
    default: '',
  })
  public xml!: string;
}
