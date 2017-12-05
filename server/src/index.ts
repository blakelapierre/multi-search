import webServer from './webServer';

import search from './search';

const ws = require('ws');

const port = process.argv[2] || 8181,
      webPort = process.argv[3] || 8182;

const server = new ws.Server({port});
console.log(process.env['DEV']);
if (process.env['DEV']) webServer('../.dev', webPort);
else webServer('../.dist', webPort);

server.on('connection', socket => {
  console.log('connected');
  socket.on('message', query => {
    search(
      query,
      ({name, results, start, end}) =>
        socket.send(JSON.stringify({query, name, results, start, end})))
    .then(o => console.log(o))
    .catch(error => socket.send(JSON.stringify(['error', query, JSON.stringify(error.toString())])));
  });
});

console.log('ws listening on', port);
console.log('http listening on', webPort);


function partialResults({name, results}) {
  const resultsToPrint = 2;
  console.log(`${name} (${results.length} total results [showing first ${resultsToPrint}]):\n`);
  if (results) console.log(`  ${results.slice(0, resultsToPrint).map(result => `${result.titles[0]} (${result.url})\n    ${result.snippet}`).join('\n\n  ')}\n`);
}

function printResults({urls, results}) {
  console.log(urls);
}

function use(fn) {
  return arg => {
    fn(arg);
    return arg;
  };
}