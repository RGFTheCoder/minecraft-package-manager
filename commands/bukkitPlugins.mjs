import c from 'ansi-colors';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync
} from 'fs';
import fetch from 'node-fetch';
import { join } from 'path';
import unzip from 'unzip-stream';
import { ensure } from '../utils/ensure.mjs';
import { input } from '../utils/getInput.mjs';
import { T } from '../utils/template.mjs';
import { removeObj } from './remove.mjs';

const templates = {
  alreadyInstalled: T`${txt =>
    c.yellowBright(txt)} is already installed. Attempting to update.`,

  bukkitDownload: T`https://dev.bukkit.org/projects/${''}/files/latest`
};

export async function installBukkitPlugin(name) {
  ensure(this, 'plugins', []);
  {
    const sameIDs = this.plugins.filter(a => a.id == name);
    if (sameIDs.length > 0) {
      console.log(templates.alreadyInstalled(name));
      console.log();
      await updateBukkitPlugin.apply(this, [name]);
      return;
    }
  }

  {
    const res = await fetch(templates.bukkitDownload(name));
    const tempFile = T`${''}/${''}.jar`;

    this.plugins.push({
      name: name,
      id: name,
      ver: 'latest',
      files: [],
      updater: 'updateBukkitPlugin'
    });
    if (!existsSync('./tmp/')) mkdirSync('./tmp/');
    const tmpdir = mkdtempSync('./tmp/');
    const tmpFile = tempFile(tmpdir, name);
    const dest = createWriteStream(tmpFile);
    const writer = res.body.pipe(dest);

    const files = this.plugins.filter(a => a.id == name)[0].files;

    files.push(tempFile('.', name));

    if (!existsSync('./plugins')) mkdirSync('./plugins');
    for (let file of files) {
      renameSync(join(tmpdir, file), join('./plugins/', file));
    }
  }
}

export async function updateBukkitPlugin(id) {
  await removeObj.apply(
    this,
    this.plugins.filter(a => a.id == id)
  );
  await installBukkitPluginObj.apply(this, [id]);
}
