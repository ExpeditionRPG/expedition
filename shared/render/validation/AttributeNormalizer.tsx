import {Logger} from '../Logger';

export default class AttributeNormalizer {
  private keySet: string[];
  private attrs: {[k: string]: string};
  private log?: Logger;

  constructor(attrs: {[k: string]: string}, log?: Logger) {
    this.keySet = [];
    this.attrs = attrs;
    this.log = log;
  }

  private extract(k: string, required?: boolean): string {
    this.keySet.push(k);
    const v = this.attrs[k];

    if (!v && required) {
      if (this.log) {
        this.log.err('missing: "' + k + '"', '424');
      }
    }
    return v;
  }

  public getBoolean(k: string, required?: boolean) {
    const v = this.extract(k, required);

    if (v === undefined) {
      return v;
    }

    if (typeof(v) === 'boolean') {
      return v;
    }

    if (typeof(v) === 'string') {
      if (v.toLowerCase() === 'true') {
        return true;
      }
      if (v.toLowerCase() === 'false') {
        return false;
      }
    }

    return false;
  }

  public getString(k: string, required?: boolean) {
    const v = this.extract(k, required);

    if (v === undefined) {
      return v;
    }

    if (typeof(v) === 'string') {
      return v;
    }

    return 'UNDEFINED';
  }

  public getNumber(k: string, required?: boolean) {
    const v: any = this.extract(k, required);

    if (v === undefined) {
      return v;
    }

    if (!isNaN(parseFloat(v)) && isFinite(v)) {
      return parseInt(v, 10);
    }

    if (this.log) {
      this.log.err(k + ' should be a number, but is ' + typeof(v), '426');
    }
    return 0;
  }

  public confirmNoExtra() {
    for (const k of Object.keys(this.attrs)) {
      let found = false;
      for (const j of this.keySet) {
        if (k === j) {
          found = true;
          break;
        }
      }

      if (found) {
        continue;
      }

      if (this.log) {
        this.log.err('unknown key: "' + k + '"', '427');
      }
    }
  }
}
