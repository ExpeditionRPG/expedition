import {Logger} from '../Logger';
import AttributeNormalizer from './AttributeNormalizer';

export default class Normalize {
  public static questAttrs(attrs: {[k: string]: string}, log?: Logger): ({[k: string]: any}) {
    const n = new AttributeNormalizer(attrs, log);
    const result = {
      author: n.getString('author'),
      email: n.getString('email'),
      familyFriendly: n.getBoolean('familyfriendly'),
      maxplayers: n.getNumber('maxplayers'),
      maxtimeminutes: n.getNumber('maxtimeminutes'),
      minplayers: n.getNumber('minplayers'),
      mintimeminutes: n.getNumber('mintimeminutes'),
      summary: n.getString('summary'),
      title: n.getString('title', true),
      url: n.getString('url'),
    };
    n.confirmNoExtra();
    return result;
  }
}
