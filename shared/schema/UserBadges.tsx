import { Badge, enumValues } from './Constants';
import { copyAndUnsetDefaults, field, SchemaBase } from './SchemaBase';

export class UserBadge extends SchemaBase {
  public static create(fields: Partial<UserBadge>) {
    return super.initialize(this, fields);
  }

  constructor(fields: Partial<UserBadge>) {
    super(fields);
  }

  public withoutDefaults() {
    return copyAndUnsetDefaults(UserBadge, this);
  }

  @field({
    allowNull: false,
    maxLength: 255,
    primaryKey: true,
  })
  public userid!: string;

  @field({
    maxLength: 255,
    primaryKey: true,
    allowNull: false,
    // Un-nested: joi 13 deep-flattened the value list, joi 16+ does not, so a
    // nested array would make the array itself the one allowed value.
    valid: enumValues(Badge),
  })
  public badge!: string;
}
