import help from './help.js';
import minimist from 'minimist';
import path from 'path';

// Get getConfig options


export default function config (processArg) {
  const argv = minimist(processArg.slice(2));

  function getConfig (option) {
    if (argv.config || argv.c) {
      return require(path.resolve(`${argv.config}`))[option];
    }
  }


  // Print help
  if (argv == undefined || argv['help'] || argv['h']) {
    help();
  }

  // Argument constants
  const EXT = argv.ext || argv.e || getConfig('ext') || '.css';
  const DIR = argv.dir || argv.d || getConfig('dir');
  const FROM = argv.from || argv.f || getConfig('from');
  const MAP = argv.map || argv.m || getConfig('map');
  const NOTIFY = argv.notify || argv.n || getConfig('notify');
  const OPTIONS = argv.options || argv.opts || getConfig('options');
  const OUTPUT = argv.output || argv.o || getConfig('output');
  const TO = argv.to || argv.t || getConfig('to');
  const PLUGINS = argv.plugins || argv.p || getConfig('plugins');
  const SOURCE = argv.src || argv.s || getConfig('src');
  const WATCH = argv.watch || argv.w || getConfig('watch');
  const DEST = TO
    ? TO
    : OUTPUT
    ? OUTPUT.match(/(.*)[\/\\]/)[1]||''
    : null;

  // If no source or exit files print help text
  if ((DIR == undefined && SOURCE == undefined) || DEST == undefined) {
    help();
  }

  return {
   EXT,
   DEST,
   DIR,
   FROM,
   MAP,
   NOTIFY,
   OPTIONS,
   OUTPUT,
   TO,
   PLUGINS,
   SOURCE,
   WATCH
  };
}
