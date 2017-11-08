const socket = new WebSocket(`ws://${window.location.hostname}:8181`);

const waitingQueries = {};

socket.addEventListener('message', ({data}) => {
  const {query, name, results} = JSON.parse(data);

  waitingQueries[query]({query, name, results});
});

export default search;

function search(query, mutation) {
  console.log('search', query, mutation);
  const results = {};
console.log('m', mutation);
  if (query) {
    Object.keys(waitingQueries).forEach(key => delete waitingQueries[key]);

    socket.send(query);

    waitingQueries[query] = response => {
      results[response.name] = response;
      mutation(response);
    };
  }

  return results;
}