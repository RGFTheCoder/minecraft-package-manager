export function T(text, ...replacements) {
  return function(...filler) {
    let out = '';
    for (let i = 0; i < filler.length; ++i) {
      out += text[i];

      if (replacements[i] instanceof Function)
        out += replacements[i](filler[i]);
      else out += filler[i];
    }
    return out + text[text.length - 1];
  };
}
