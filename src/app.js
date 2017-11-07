import { h, render } from 'preact-cycle';

const SEARCH = ({enteredQuery, query, engines}) => ({
  query: enteredQuery,
  enteredQuery,
  engines: engines.map(engine => {
    if (enteredQuery) engine.url = engine.queryUrl + enteredQuery;
    return engine;
  })
});

const TOGGLE_VIEW = (_) => {
  _.view = _.view === 'iframe' ? '' : 'iframe';
};

// jshint ignore:start
const QUERY_CHANGED = ({enteredQuery, ...p}, {target:{value}}) => ({
  enteredQuery: value,
  ...p
});
// jshint ignore:end

// const QUERY_CHANGED = (_, {target:{value}}) => { _.enteredQuery = value; },
//       SEARCH = (_) => { 
//         _.query = _.enteredQuery;
//         _.engines.forEach(engine => {
//           if (_.query) engine.url = engine.queryUrl + _.query;
//         });
//       };

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
    <button onClick={mutation(TOGGLE_VIEW)}></button>
    <form onSubmit={mutation(SEARCH)} action="javascript:">
      <input placeholder="Enter Query Text" value={enteredQuery} onInput={mutation(QUERY_CHANGED)} autoFocus />
    </form>
  </query>
  // jshint ignore:end
);

const Engines = (_, {engines, view}) => (
  // jshint ignore:start
  <engines>
    {view === 'iframe' ? engines.map(engine => <Engine engine={engine} />) : undefined}
  </engines>
  // jshint ignore:end
);

const Engine = ({enteredQuery, engine: {name, url}}, {view, mutation}) => (
  // jshint ignore:start
  <engine >
    <name>{name}</name>
    {url ? <iframe src={url} frameBorder={0} sandbox="allow-same-origin allow-scripts" /> : undefined}
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