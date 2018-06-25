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
      primaryKey: true,
      allowNull: false,
      maxLength: 32,
      default: '',
      valid: [13],
    }) public pkey: number;

    @field({
      primaryKey: true,
      allowNull: false,
      maxLength: 32,
      default: 'defaultstr',
    }) public qkey: string;

    @field({}) public rkey: number;

    // Tests allowNull implicitly
    @field({
      allowNull: true,
      extra: 'DECIMAL_4_2',
    }) public skey: string;
}

describe('SchemaBase', () => {
  it('create() returns the class object when valid', () => {
    const t = TestImpl.create({pkey: 13, rkey: 0});
    expect(t instanceof TestImpl).toEqual(true);
  });
  it('create() returns error when validation fails', () => {
    const t = TestImpl.create({pkey: 16, rkey: 0});
    expect(t instanceof Error).toEqual(true);
  });
  it('Excludes parameters not matching a field', () => {
    const t = new TestImpl({pkey: 13, notAKey: true, rkey: 0} as any);
    expect((t as any).notAKey).toBeUndefined();
  });
  it('Applies defaults for fields not specified', () => {
    const t = new TestImpl({pkey: 13, rkey: 0});
    expect(t.qkey).toEqual('defaultstr');
  });
  it('Applies defaults for null/undefined fields', () => {
    const t = new TestImpl({pkey: 13, qkey: null, rkey: 0} as any);
    expect(t.qkey).toEqual('defaultstr');
    const t2 = new TestImpl({pkey: 13, qkey: undefined, rkey: 0} as any);
    expect(t2.qkey).toEqual('defaultstr');
  });
  it('withoutDefaults returns the object with defaulted params set to null', () => {
    const t = new TestImpl({pkey: 13, rkey: 0}).withoutDefaults();
    expect(t.qkey).toEqual(undefined);
  });
  it('Coerces types as part of validation', () => {
    const t = new TestImpl({pkey: ('13' as any), rkey: 0});
    expect(typeof(t.pkey)).toEqual('number');
  });
  it('Coerces a number even if the field has no extra options', () => {
    const t = new TestImpl({pkey: 13, rkey: ('13' as any)});
    expect(typeof(t.rkey)).toEqual('number');
  });
  it('Is self-constructable', () => {
    new TestImpl(new TestImpl({pkey: 13, rkey: 0}));
  });
});
