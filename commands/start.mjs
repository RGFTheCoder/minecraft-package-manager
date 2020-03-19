import { exec, spawn } from 'child_process';
import { ensure } from '../utils/ensure.mjs';
import { onExit } from '../utils/onExit.mjs';

export async function start() {
  ensure(this, 'minRam', '1G');
  ensure(this, 'maxRam', '2G');
  const childProcess = spawn(
    'java',
    [
      '-Xmx' + this.maxRam,
      '-Xms' + this.minRam,
      '-jar',
      'server.jar',
      '--nogui'
    ],
    {
      stdio: [process.stdin, process.stdout, process.stderr]
    }
  );
  await onExit(childProcess); //
}
