import { levenshtein_distance } from '../utils/strDist.mjs';
import { T } from '../utils/template.mjs';
import { input } from '../utils/getInput.mjs';
import c from 'ansi-colors';
import { unlink, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

const templates = {
  pluginTextList: T`[${txt => c.blueBright(txt)}]: ${txt =>
    c.yellowBright(txt)}`,

  pluginText: T`${txt => c.yellowBright(txt)}`
};

export async function remove(name) {
  console.log(name);
  const plugins = this.plugins
    .sort(
      (a, b) =>
        levenshtein_distance(name, a.name) - levenshtein_distance(name, b.name)
    )
    .slice(0, 10);

  for (let i = 0; i < plugins.length; ++i) {
    const plugin = plugins[i];
    console.log(templates.pluginTextList(i, plugin.name));
  }

  const choice =
    plugins[
      (await input(
        `Which plugin [0-${plugins.length - 1}] do you want to uninstall? `
      )) | 0
    ];

  await removeObj.apply(this, [choice]);
}

export async function removeObj(choice) {
  const id = this.plugins.indexOf(choice);

  console.log(templates.pluginText(choice.name));
  for (let i of choice.files) {
    if (existsSync(join('./plugins', i))) unlinkSync(join('./plugins', i));
  }

  this.plugins.splice(id, 1);
}
