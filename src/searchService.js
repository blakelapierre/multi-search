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

  const results = {};

  if (query) {
    Object.keys(waitingQueries).forEach(key => delete waitingQueries[key]);

    serverConnection.send(query);

    waitingQueries[query] = response => {
      results[response.name] = response;
      mutation(response);
    };
  }

  return results;
}