import {Logger} from '../Logger'

export class AttributeNormalizer {
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
    var v = this.attrs[k];

    if (!v && required) {
      if (this.log) {
        this.log.err('missing: "' + k + '"', '424');
      }
    }
    return v;
  }

  getBoolean(k: string, required?: boolean) {
    var v = this.extract(k, required);

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

  getString(k: string, required?: boolean) {
    var v = this.extract(k, required);

    if (v === undefined) {
      return v;
    }

    if (typeof(v) === 'string') {
      return v;
    }

    return 'UNDEFINED';
  }

  getNumber(k: string, required?: boolean) {
    var v: any = this.extract(k, required);

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

  confirmNoExtra() {
    for (let k of Object.keys(this.attrs)) {
      var found = false;
      for (let j of this.keySet) {
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

export class Normalize {
  static questAttrs(attrs: {[k: string]: string}, log?: Logger): ({[k: string]: any}) {
    var n = new AttributeNormalizer(attrs, log);
    var result = {
      title: n.getString('title', true),
      summary: n.getString('summary'),
      author: n.getString('author'),
      email: n.getString('email'),
      url: n.getString('url'),
      minplayers: n.getNumber('minplayers'),
      maxplayers: n.getNumber('maxplayers'),
      mintimeminutes: n.getNumber('mintimeminutes'),
      maxtimeminutes: n.getNumber('maxtimeminutes'),
      familyFriendly: n.getBoolean('familyfriendly'),
    };
    n.confirmNoExtra();
    return result;
  }

  static combatAttrs(attrs: {[k: string]: string}, log?: Logger): ({[k: string]: any}) {
    return {}; // TODO
  }

  static roleplayAttrs(attrs: {[k: string]: string}, log?: Logger): ({[k: string]: any}) {
    return {}; // TODO
  }
}
