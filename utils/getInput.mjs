import readline from 'readline';

export function input(text) {
  return new Promise((res, rej) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(text, function(answer) {
      rl.close();
      res(answer);
    });
  });
}
