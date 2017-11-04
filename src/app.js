import { h, render } from 'preact-cycle';

const SEARCH = ({enteredQuery, query, engines}) => ({
  query: enteredQuery,
  enteredQuery,
  engines: engines.map(engine => {
    if (enteredQuery) engine.url = engine.queryUrl + enteredQuery;
    return engine;
  })
});

const QUERY_CHANGED = ({enteredQuery, query, engines}, {target:{value}}) => ({
  enteredQuery: value,
  query,
  engines
});

const MultiSearch = ({engines}) => (
  // jshint ignore:start
  <multi-select>
    <Query />
    <Engines />
  </multi-select>
  // jshint ignore:end
);

const Query = (_, {enteredQuery, mutation}) => (
  // jshint ignore:start
  <query>
    <form onSubmit={mutation(SEARCH)} action="javascript:">
      <input placeholder="Enter Query Text" value={enteredQuery} onInput={mutation(QUERY_CHANGED)} autoFocus />
    </form>
  </query>
  // jshint ignore:end
);

const Engines = (_, {engines}) => (
  // jshint ignore:start
  <engines>
    {engines.map(engine => <Engine engine={engine} />)}
  </engines>
  // jshint ignore:end
);

const Engine = ({enteredQuery, engine: {name, url}}) => (
  // jshint ignore:start
  <engine>
    <name>{name}</name>
    {url ? <iframe src={url} /> : undefined}
  </engine>
  // jshint ignore:end
);

render(
  // jshint ignore:start
  MultiSearch, SEARCH({
    enteredQuery: window.location.search.substr(1).split('=')[1] || '',
    engines: [{
      'name': 'Google',
      'queryUrl': 'https://google.com/search?q='
    },{
      'name': 'DuckDuckGo',
      'queryUrl': 'https://duckduckgo.com?q='
    },{
      'name': 'Bing',
      'queryUrl': 'https://bing.com?q='
    },{
      'name': 'Yahoo',
      'queryUrl': 'https://search.yahoo.com/search?p='
    }],
  }), document.body
  // jshint ignore:end
);