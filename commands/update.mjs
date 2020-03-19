import * as cmds from '../commands.mjs';

export async function update() {
  await cmds[this.updater].apply(this);
  for (let i of this.plugins) {
    await cmds[i.updater].apply(this, [
      i.id,
      this.plugins.filter(a => a.id == i.id)[0]
    ]);
  }
}

export async function updateF() {
  this.serverBuild = 0;
  await cmds[this.updater].apply(this);
  for (let i of this.plugins) {
    i.ver = 0;
    await cmds[i.updater].apply(this, [
      i.id,
      this.plugins.filter(a => a.id == i.id)[0]
    ]);
  }
}
