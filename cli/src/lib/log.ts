import pc from 'picocolors';

export const log = {
  info: (msg: string) => console.log(pc.blue('[i]'), msg),
  success: (msg: string) => console.log(pc.green('[ok]'), msg),
  warn: (msg: string) => console.warn(pc.yellow('[!]'), msg),
  error: (msg: string) => console.error(pc.red('[x]'), msg),
  step: (msg: string) => console.log(pc.cyan('>'), pc.bold(msg)),
  hint: (msg: string) => console.log('   ' + pc.gray(msg)),
  blank: () => console.log(''),
};
