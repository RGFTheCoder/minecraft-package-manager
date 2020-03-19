import { createWriteStream, existsSync, unlinkSync } from 'fs';
import fetch from 'node-fetch';
import { T } from '../utils/template.mjs';
import { init } from './init.mjs';

const downloadURL = T`https://papermc.io/api/v1/paper/${0}/${0}/download`;
const dataURL = T`https://papermc.io/api/v1/paper/${''}/latest`;

export async function initPaper(MCVer = '1.15.2') {
  const res = await fetch(dataURL(MCVer));
  const json = await res.json();
  if (typeof json.error !== 'undefined') {
    return await init.apply(this);
  }
  if (MCVer !== this.MCVer || json.build !== this.serverBuild) {
    const res = await fetch(downloadURL(json.version, json.build));
    if (existsSync('./server.jar')) unlinkSync('./server.jar');
    const dest = createWriteStream('./server.jar');
    res.body.pipe(dest);
    this.MCVer = MCVer;
    this.serverBuild = json.build;
  }
}
export async function updatePaper() {
  const res = await fetch(dataURL(this.MCVer));
  const json = await res.json();
  if (typeof json.error !== 'undefined') {
    return await init.apply(this);
  }
  if (json.build !== this.serverBuild) {
    const res = await fetch(downloadURL(json.version, json.build));
    if (existsSync('./server.jar')) unlinkSync('./server.jar');
    const dest = createWriteStream('./server.jar');
    res.body.pipe(dest);
    this.serverBuild = json.build;
  }
}
