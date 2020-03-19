import { installSpigotPlugin } from './spigotPlugins.mjs';
import { installBukkitPlugin } from './bukkitPlugins.mjs';
export async function install(type = 's', name) {
  switch (type) {
    case 's':
      return await installSpigotPlugin.apply(this, [name]);
    case 'b':
      return await installBukkitPlugin.apply(this, [name]);
  }
}
