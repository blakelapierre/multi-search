const waitingQueries = {};

// jshint ignore:start
class ServerConnection {
  socket = new WebSocket(`ws://${window.location.hostname}:8181`)
  queue = []

  constructor(messageHandler) {
    const {socket} = this;

    socket.addEventListener('open', event => {
      this.queue.forEach(query => this.send(query))
    });

    socket.addEventListener('close', event => {
      // reconnect? (maybe on 'closing' instead?)
    });

    socket.addEventListener('message', messageHandler);
  }

  send(...args) {
    if (this.socket.readyState === this.socket.OPEN) this.socket.send(...args);
    else this.queue.push([...args]);
  }
}
// jshint ignore:end

const serverConnection = new ServerConnection(({data}) => {
  const {query, name, results, start, end} = JSON.parse(data);

  waitingQueries[query]({query, name, results, start, end});
});

export default search;

function search(query, mutation) {
  const result = {
    query,
    time: new Date().getTime(),
    responses: [],
    urls: {},
    top: []
  };

  if (query) {
    Object.keys(waitingQueries).forEach(key => delete waitingQueries[key]);

    serverConnection.send(query);

    waitingQueries[query] = response => {
      result.urls = response.results.reduce((urls, {url}, i) => {
                  (urls[url] = urls[url] || []).push([response.name, i]);
                  return urls;
                }, result.urls);

      result.top = Object.keys(result.urls).map(url => [url, result.urls[url]]);
      result.top.sort(([_, a], [__, b]) => {
        const d = b.length - a.length;
        if (d === 0) return a.reduce((sum, [_, i]) => sum + i, 0) - b.reduce((sum, [_, i]) => sum + i, 0);
        else return d;
      });

      result.responses.push(response);
      mutation(result, response);
    };
  }

  return result;
}