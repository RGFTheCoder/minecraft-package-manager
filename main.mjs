#!/bin/sh
':'; //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"
const args = process.argv.slice(2);

import * as fs from 'fs';
import * as cmds from './commands.mjs';
import { removeDir } from './utils/rmdir.mjs';
import { closest } from './utils/strDist.mjs';

const CONF = {
  packagePath: './mcpk.json',
  motd: 'MinecraftPM'
};

if (!fs.existsSync(CONF.packagePath)) fs.writeFileSync(CONF.packagePath, '{}');

CONF.data = JSON.parse(fs.readFileSync(CONF.packagePath));

console.log(CONF.motd);

if (typeof cmds[args[0]] == 'undefined') {
  console.error(`The command ${args[0]} is not installed.`);

  console.error(`Did you mean ${closest(args[0], Object.keys(cmds))}`);

  process.exit(1);
}
cmds[args[0]].apply(CONF.data, args.slice(1)).then(() => {
  fs.writeFile(
    CONF.packagePath,
    JSON.stringify(CONF.data, undefined, 2),
    () => {}
  );

  if (fs.existsSync('./tmp')) {
    removeDir('./tmp');
  }
});
