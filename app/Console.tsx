const START_BUFFER_MAX_LENGTH = 25;
const TAIL_BUFFER_MAX_LENGTH = 50;

const startingbuffer: string[] = [];
const tailbuffer: string[] = [];
let omittedCount = 0;

export function logToBuffer(line: string) {
  if (startingbuffer.length < START_BUFFER_MAX_LENGTH) {
    startingbuffer.push(line);
  } else {
    tailbuffer.push(line);
    while (tailbuffer.length > TAIL_BUFFER_MAX_LENGTH) {
      tailbuffer.shift();
      omittedCount++;
    }
  }
}

export function getLogBuffer(): Readonly<string[]> {
  if (tailbuffer.length > 0) {
    const result = [...startingbuffer];
    if (omittedCount > 0) {
      result.push('<<<<<<' + omittedCount.toString() + ' LOGS OMITTED>>>>>>>')
    }
    Array.prototype.push.apply(result, tailbuffer);
    return result;
  }
  return startingbuffer;
}
