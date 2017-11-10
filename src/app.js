import { h, render } from 'preact-cycle';

import searchService from './searchService';

// jshint ignore:start
const SEARCH = ({enteredQuery, query, searchQuery, searchResponses, engines, results, urls, top, ...p}, mutation) => ({
  query: enteredQuery,
  enteredQuery,
  results: [],
  urls: {},
  top: undefined,
  searchQuery: enteredQuery,
  searchResponses: enteredQuery ? searchService(enteredQuery, mutation(ADD_RESPONSE)) : undefined,
  engines: engines.map(engine => {
    if (enteredQuery) engine.url = engine.queryUrl + enteredQuery;
    return engine;
  }),
  ...p
});
// jshint ignore:end

const ADD_RESPONSE = (_, {query, name, results, start, end}) => {
  console.log(_, query);
  if (_.searchQuery === query) {
    _.results.push({name, results, start, end});

    _.urls =  results.reduce((urls, {url}, i) => {
                (urls[url] = urls[url] || []).push([name, i]);
                return urls;
              }, _.urls);

    _.top = Object.keys(_.urls).map(url => [url, _.urls[url]]);
    _.top.sort(([_, a], [__, b]) => b.length - a.length);

    console.log('responses added', _.urls, _.search);
  }
};

const TOGGLE_VIEW = (_) => {
  _.view = _.view === 'iframe' ? '' : 'iframe';
};

// jshint ignore:start
const QUERY_CHANGED = ({enteredQuery, ...p}, {target:{value}}) => ({
  enteredQuery: value,
  ...p
});
// jshint ignore:end

// jshint ignore:start
const SHOW_MORE = (_, result) => {
  result.sliceEnd = result.results.length;
};
// jshint ignore:end

// const QUERY_CHANGED = (_, {target:{value}}) => { _.enteredQuery = value; },
//       SEARCH = (_) => {
//         _.query = _.enteredQuery;
//         _.engines.forEach(engine => {
//           if (_.query) engine.url = engine.queryUrl + _.query;
//         });
//       };

const MultiSearch = ({engines, view}) => (
  // jshint ignore:start
  <multi-select>
    <Query />
    {view === 'iframe' ? <Engines /> : <Results />}
  </multi-select>
  // jshint ignore:end
);

const Query = (_, {enteredQuery, mutation}) => (
  // jshint ignore:start
  <query>
    <button onClick={mutation(TOGGLE_VIEW)}></button>
    <form onSubmit={mutation(SEARCH, mutation)} action="javascript:">
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

const Engine = ({enteredQuery, engine: {name, url}}, {view, mutation}) => (
  // jshint ignore:start
  <engine >
    <name>{name}</name>
    {url ? <iframe src={url} frameBorder={0} sandbox="allow-same-origin allow-scripts" /> : undefined}
  </engine>
  // jshint ignore:end
);

const Results = (_, {results: engineResults, mutation}) => (
  // jshint ignore:start
  <results>
    <sites>
      {engineResults ? engineResults.map(({name, results, start, end, sliceStart = 0, sliceEnd = 3}, i) => (
        <result>
          <engine>
            <img src={`//${name}.com/favicon.ico`} class="engine-icon" />
            <name>{name}</name>
            <time>{end - start}<units>ms</units> <bar style={{width: `${2 * (end - start) / 1000}em`}}></bar></time>
          </engine>
          <items>
            {results.slice(sliceStart, sliceEnd).map(({titles, snippet, url, images}) => (
              <item>
                <a href={url}>{titles[0]}</a>
                <div>
                  {images && images.length > 0 ? images.map(({src, height, width}) => <img src={src} width={width} height={height} />) : undefined}
                  <snippet>{snippet}</snippet>
                </div>
              </item>
            ))}
            <more>
              {results.length - sliceEnd > 0 ? <div onClick={mutation(SHOW_MORE, engineResults[i])}>+ {results.length - sliceEnd} more</div>
                                             : undefined}
            </more>
          </items>
        </result>
      )) : undefined}
    </sites>
    <Top />
  </results>
  // jshint ignore:end
);

const Top = (_, {top, engines}) => (
  // jshint ignore:start
  <top>
    {top ? (<urls>{top.map(([url, engines]) => (<url><EngineIcons engines={engines} /><a href={url}>{url}</a></url>))}</urls>) : undefined}
  </top>
  // jshint ignore:end
);

const EngineIcons = ({engines}) => (
  // jshint ignore:start
  <engine-icons>
    {console.log(engines)}
    {engines.map(([name]) => (<img src={`//${name}.com/favicon.ico`} class="engine-icon" />))}
  </engine-icons>
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