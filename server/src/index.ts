import search from './search';

const ws = require('ws');

const port = 8181;

const server = new ws.Server({port});

server.on('connection', socket => {
  socket.on('message', message => {
    console.log(message);
    
  });
});

console.log('listening on', port)


// search('test', partialResults)
//   .then(use(({urls}) => {
//     const list = Object.keys(urls).map(url => [url, urls[url]]);
//     list.sort(([_, a], [__, b]) => b.length - a.length);
//     console.log(list);
//   }))
//   .then(use(printResults))
//   .catch(error => console.log('error', error));

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