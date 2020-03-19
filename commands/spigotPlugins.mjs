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
  resourceData: T`https://api.spiget.org/v2/resources/${0}`,

  search: T`https://api.spiget.org/v2/search/resources/${''}`,

  pluginTextList: T`[${txt => c.blueBright(txt)}]: ${txt =>
    c.yellowBright(txt)} (${txt => c.greenBright(txt)} Downloads)`,

  pluginText: T`${txt => c.yellowBright(txt)}`,

  alreadyInstalled: T`${txt =>
    c.yellowBright(txt)} is already installed. Attempting to update.`,

  versionChange: T`Updating ${txt => c.yellowBright(txt)} from ${txt =>
    c.redBright(txt)} to ${txt => c.greenBright(txt)}`,

  latestVersion: T`${txt =>
    c.yellowBright(txt)} is already on latest version ${txt =>
    c.greenBright(txt)}`,

  spigotDownload: T`https://api.spiget.org/v2/resources/${0}/download`
};

export async function installSpigotPlugin(name) {
  const res = await fetch(templates.search(name));
  const jsonData = await res.json();

  for (let i = 0; i < jsonData.length; ++i) {
    const plugin = jsonData[i];
    plugin.name = plugin.name.replace(/[^a-zA-Z0-9_]/g, '');
    console.log(templates.pluginTextList(i, plugin.name, plugin.downloads));
  }

  const choice =
    jsonData[
      (await input(`\nWhich plugin [0-9] do you want to install? `)) | 0
    ];

  console.log(templates.pluginText(choice.name));
  console.log();

  await installSpigotPluginObj.apply(this, [choice]);
}

export async function installSpigotPluginObj(choice) {
  ensure(this, 'plugins', []);
  {
    const sameIDs = this.plugins.filter(a => a.id == choice.id);
    if (sameIDs.length > 0) {
      console.log(templates.alreadyInstalled(choice.name));
      console.log();
      await updateSpigotPlugin.apply(this, [choice.id, sameIDs[0]]);
      return;
    }
  }

  {
    const res = await fetch(templates.spigotDownload(choice.id));
    const tempFile = T`${''}/${''}${''}`;

    this.plugins.push({
      name: choice.name,
      id: choice.id,
      ver: choice.version.id,
      files: [],
      updater: 'updateSpigotPlugin'
    });
    if (!existsSync('./tmp/')) mkdirSync('./tmp/');
    const tmpdir = mkdtempSync('./tmp/');
    const tmpFile = tempFile(tmpdir, choice.name, choice.file.type);
    const dest = createWriteStream(tmpFile);
    const fileDir = tempFile(tmpdir, choice.name, choice.file.type);
    const writer = res.body.pipe(dest);

    await new Promise((res, rej) => {
      writer.once('close', res);
      writer.once('error', rej);
    });

    const files = this.plugins.filter(a => a.id == choice.id)[0].files;

    switch (choice.file.type.slice(1)) {
      case 'zip':
        {
          const zip = createReadStream(fileDir).pipe(unzip.Parse());
          for await (const entry of zip) {
            let filePath = entry.path;
            let type = entry.type; // 'Directory' or 'File'
            // var size = entry.size; // might be undefined in some archives
            if (type == 'File') {
              entry.pipe(createWriteStream(join(tmpdir, filePath)));
              files.push(filePath);
            }
          }
        }
        break;
      case 'jar':
        {
          files.push(tempFile('.', choice.name, choice.file.type));
        }
        break;
    }

    if (!existsSync('./plugins')) mkdirSync('./plugins');
    for (let file of files) {
      renameSync(join(tmpdir, file), join('./plugins/', file));
    }
  }
}

export async function updateSpigotPlugin(id, conf) {
  let res = await fetch(templates.resourceData(id));
  let json = await res.json();
  let choice = json;
  if (choice.version.id > conf.ver) {
    console.log(
      templates.versionChange(choice.name, conf.ver, choice.version.id)
    );
    await removeObj.apply(
      this,
      this.plugins.filter(a => a.id == choice.id)
    );
    await installSpigotPluginObj.apply(this, [choice]);
  } else {
    console.log(templates.latestVersion(choice.name, choice.version.id));
    console.log();
  }
}
