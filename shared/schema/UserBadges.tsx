import {Badge, enumValues} from './Constants';
import {copyAndUnsetDefaults, field, SchemaBase} from './SchemaBase';

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
  }) public userid: string;

  @field({
    maxLength: 255,
    primaryKey: true,
    allowNull: false,
    valid: [enumValues(Badge)],
  }) public badge: string;

}
