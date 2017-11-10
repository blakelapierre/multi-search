const socket = new WebSocket(`ws://${window.location.hostname}:8181`);

const waitingQueries = {};

socket.addEventListener('message', ({data}) => {
  const {query, name, results, start, end} = JSON.parse(data);

  waitingQueries[query]({query, name, results, start, end});
});

export default search;

function search(query, mutation) {

  const results = {};

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