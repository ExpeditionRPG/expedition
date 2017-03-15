import {ErrorType} from './types'

const Fs: any = require('fs');

declare var exports: ErrorType[];


const errors: string[] = Fs.readdirSync('./errors/definitions');

errors.forEach((err) => {
  const Err: ErrorType = Object.assign({},
    (require('./definitions/' + err) as ErrorType),
    {NUMBER: Number(err.replace('.tsx', ''))}
  );
  exports[Err.NUMBER] = Err;
});
