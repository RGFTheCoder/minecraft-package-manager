import * as fs from 'fs';
import * as path from 'path';

export function removeDir(dir) {
  const files = fs.readdirSync(dir);
  for (let filename of files) {
    if (fs.lstatSync(path.join(dir, filename)).isDirectory()) {
      removeDir(path.join(dir, filename));
    } else {
      fs.unlinkSync(path.join(dir, filename));
    }
  }
  fs.rmdirSync(dir);
}
