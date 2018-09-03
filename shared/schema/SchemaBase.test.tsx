import {copyAndUnsetDefaults, field, SchemaBase} from './SchemaBase';

class TestImpl extends SchemaBase {
    public static create(fields: Partial<TestImpl>) {
      return super.initialize(this, fields);
    }

    constructor(fields: Partial<TestImpl>) {
      super(fields);
    }

    public withoutDefaults() {
      return copyAndUnsetDefaults(TestImpl, this);
    }

    @field({
      allowNull: false,
      default: '',
      maxLength: 32,
      primaryKey: true,
      valid: [13],
    }) public pkey: number;

    @field({
      allowNull: false,
      default: 'defaultstr',
      maxLength: 32,
      primaryKey: true,
    }) public qkey: string;

    @field({}) public rkey: number;

    // Tests allowNull implicitly
    @field({
      allowNull: true,
      extra: 'DECIMAL_4_2',
    }) public skey: string;
}

describe('SchemaBase', () => {
  test('create() returns the class object when valid', () => {
    const t = TestImpl.create({pkey: 13, rkey: 0});
    expect(t instanceof TestImpl).toEqual(true);
  });
  test('create() returns error when validation fails', () => {
    const t = TestImpl.create({pkey: 16, rkey: 0});
    expect(t instanceof Error).toEqual(true);
  });
  test('Excludes parameters not matching a field', () => {
    const t = new TestImpl({pkey: 13, notAKey: true, rkey: 0} as any);
    expect((t as any).notAKey).toBeUndefined();
  });
  test('Applies defaults for fields not specified', () => {
    const t = new TestImpl({pkey: 13, rkey: 0});
    expect(t.qkey).toEqual('defaultstr');
  });
  test('Applies defaults for null/undefined fields', () => {
    const t = new TestImpl({pkey: 13, qkey: null, rkey: 0} as any);
    expect(t.qkey).toEqual('defaultstr');
    const t2 = new TestImpl({pkey: 13, qkey: undefined, rkey: 0} as any);
    expect(t2.qkey).toEqual('defaultstr');
  });
  test('withoutDefaults returns the object with defaulted params set to null', () => {
    const t = new TestImpl({pkey: 13, rkey: 0}).withoutDefaults();
    expect(t.qkey).toEqual(undefined);
  });
  test('Coerces types as part of validation', () => {
    const t = new TestImpl({pkey: ('13' as any), rkey: 0});
    expect(typeof(t.pkey)).toEqual('number');
  });
  test('Coerces a number even if the field has no extra options', () => {
    const t = new TestImpl({pkey: 13, rkey: ('13' as any)});
    expect(typeof(t.rkey)).toEqual('number');
  });
  test('Is self-constructable', () => {
    const t = new TestImpl(new TestImpl({pkey: 13, rkey: 0}));
    expect(t instanceof TestImpl).toEqual(true);
  });
});
