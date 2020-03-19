import { initPaper } from './getPaper.mjs';

export async function init(ver, type = 'p') {
  switch (type) {
    case 'p':
      this.serverType = 'paper';
      this.updater = 'updatePaper';
      return await initPaper.apply(this, [ver]);
  }
}
