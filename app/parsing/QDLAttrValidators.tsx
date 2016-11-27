
function isNumeric(n: any): boolean {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isString(v: any): boolean {
  return (typeof(v) === 'string');
}

// TODO: Stronger matching of email/url
export const questAttrValidators: {[k: string]: (v: any)=>boolean} = {
  'summary': isString,
  'author': isString,
  'email': isString,
  'url': isString,
  'minplayers': isNumeric,
  'maxplayers': isNumeric,
  'mintimeminutes': isNumeric,
  'maxtimeminutes': isNumeric,
};

export const requiredQuestAttrs: string[] = [
  'minplayers',
  'maxplayers',
  'author'
];