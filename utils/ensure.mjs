export function ensure(object, prop, def) {
  if (typeof object[prop] == 'undefined') {
    object[prop] = def;
  }
  return object[prop];
}
