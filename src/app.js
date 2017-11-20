import { h, render } from 'preact-cycle';

import searchService from './searchService';

// jshint ignore:start
const SEARCH = ({ui: {buildingQuery}, searches, ...p}, mutation) => ({
  ui: {query: buildingQuery, buildingQuery},
  searches: [searchService(buildingQuery, mutation(ADD_RESPONSE))].concat(searches),
  // searches: [{
  //   query,
  //   time: new Date().getTime(),
  //   responses: searchService(query, mutation(ADD_RESPONSE))
  // }].concat(searches),
  ...p
});

// const SEARCH = ({enteredQuery, query, searchQuery, searchResponses, engines, results, urls, top, ...p}, mutation) => ({
//   query: enteredQuery,
//   enteredQuery,
//   results: [],
//   urls: {},
//   top: undefined,
//   searchQuery: enteredQuery,
//   searchResponses: enteredQuery ? searchService(enteredQuery, mutation(ADD_RESPONSE)) : undefined,
//   engines: engines.map(engine => {
//     if (enteredQuery) engine.url = engine.queryUrl + enteredQuery;
//     return engine;
//   }),
//   ...p
// });
// jshint ignore:end

const ADD_RESPONSE = (_, result) => {

};

// const ADD_RESPONSE = (_, {query, , {query, name, results, start, end}) => {
//   if (_.searchQuery === query) {
//     _.results.push({name, results, start, end});

//     _.urls =  results.reduce((urls, {url}, i) => {
//                 (urls[url] = urls[url] || []).push([name, i]);
//                 return urls;
//               }, _.urls);

//     _.top = Object.keys(_.urls).map(url => [url, _.urls[url]]);
//     _.top.sort(([_, a], [__, b]) => {
//       const d = b.length - a.length;
//       if (d === 0) return a.reduce((sum, [_, i]) => sum + i, 0) - b.reduce((sum, [_, i]) => sum + i, 0);
//       else return d;
//     });
//   }
// };

const TOGGLE_VIEW = (_) => {
  _.view = _.view === 'iframe' ? '' : 'iframe';
};

// jshint ignore:start
const QUERY_CHANGED = ({ui}, {target:{value}}) => {
  ui.buildingQuery = value;
};
// jshint ignore:end

// jshint ignore:start
const SHOW_MORE = (_, result) => {
  result.sliceEnd = result.results.length;
};
// jshint ignore:end

// jshint ignore:start
const SET_HIGHLIGHT_URL = (_, url) => {
  _.highlightUrl = url;
};
// jshint ignore:end

// const QUERY_CHANGED = (_, {target:{value}}) => { _.enteredQuery = value; },
//       SEARCH = (_) => {
//         _.query = _.enteredQuery;
//         _.engines.forEach(engine => {
//           if (_.query) engine.url = engine.queryUrl + _.query;
//         });
//       };

const MultiSearch = ({engines, view, ui: {query}}, {searches: [search], mutation}) => (
  // jshint ignore:start
  <multi-search className={{'searched': query}}>
  {console.log(query, search)}
    {query && !search ? mutation(SEARCH, mutation)(query) : undefined}
    <Query />
    {view === 'iframe' ? <Engines /> : <Results />}
  </multi-search>
  // jshint ignore:end
);


  // jshint ignore:start
const Query = (_, {ui: {buildingQuery = ''}, mutation}) => (
  <query className={`characters-${Math.min(16, buildingQuery.length)}`}>
    {buildingQuery ? <button onClick={mutation(TOGGLE_VIEW)}></button> : undefined}
    <form onSubmit={mutation(SEARCH, mutation)} action="javascript:">
      <input placeholder="Enter Query Text" value={buildingQuery} onInput={mutation(QUERY_CHANGED)} autoFocus />
    </form>
  </query>
);
  // jshint ignore:end

const Engines = (_, {engines}) => (
  // jshint ignore:start
  <engines>
    {engines.map(engine => <Engine engine={engine} />)}
  </engines>
  // jshint ignore:end
);

const Engine = ({engine: {name, url}}, {view, mutation}) => (
  // jshint ignore:start
  <engine >
    <name>{name}</name>
    {url ? <iframe src={url} frameBorder={0} sandbox="allow-same-origin allow-scripts" /> : undefined}
  </engine>
  // jshint ignore:end
);

const Results = (_, {searches: [search], highlightUrl, mutation}) => search ? (
  // jshint ignore:start
  <results>
    <sites>
      {search.responses.map((response, i) => <EngineResults {...response} i={i} search={search} />)}
    </sites>
    <Top />
  </results>
  // jshint ignore:end
) : undefined;

// jshint ignore:start
const EngineResults = ({name, results, start, end, sliceStart = 0, sliceEnd = 3, i, search: {responses}}, {mutation}) => (
  <result>
    <engine>
      <img src={`//${name}.com/favicon.ico`} class="engine-icon" />
      <name>{name}</name>
      <time>{end - start}<units>ms</units> <bar style={{width: `${2 * (end - start) / 1000}em`}}></bar></time>
    </engine>
    <items>
      {results.slice(sliceStart, sliceEnd).map(result => <Result {...result} />)}
      <more>
        {results.length - sliceEnd > 0 ? <div onClick={mutation(SHOW_MORE, responses[i])}>+ {results.length - sliceEnd} more</div>
                                       : undefined}
      </more>
    </items>
  </result>
);
// jshint ignore:end

const Result = ({titles, snippet, url, images}, {highlightUrl, mutation}) => (
  // jshint ignore:start
  <item onMouseOver={mutation(SET_HIGHLIGHT_URL, url)} className={{'highlight': url === highlightUrl}}>
    <a href={url}>{titles[0]}</a>
    <div>
      {images && images.length > 0 ? images.map(({src, height, width}) => <img src={src} width={width} height={height} />) : undefined}
      <snippet>{snippet}</snippet>
    </div>
  </item>
  // jshint ignore:end
);

const Top = (_, {searches: [{top}], highlightUrl, engines, mutation}) => (
  // jshint ignore:start
  <top>
    {top ? (<urls>{top.map(([url, engines]) => (<url onMouseOver={mutation(SET_HIGHLIGHT_URL, url)} className={{'highlight': url === highlightUrl}}><EngineIcons engines={engines} /><a href={url} title={url}>{url.slice(0, Math.min(80, url.length))}{url.length > 75 ? '...' : ''}</a></url>))}</urls>) : undefined}
  </top>
  // jshint ignore:end
);

const EngineIcons = ({engines}) => (
  // jshint ignore:start
  <engine-icons>
    {engines.map(([name, position]) => (<img src={`//${name}.com/favicon.ico`} class="engine-icon" title={`${name} Rank: ${position + 1}`} />))}
  </engine-icons>
  // jshint ignore:end
);

const query = decodeURIComponent(window.location.search.substr(1).split('=')[1] || '').replace(/\+/g, ' ');

render(
  // jshint ignore:start
  MultiSearch, {
    // enteredQuery: decodeURIComponent(window.location.search.substr(1).split('=')[1] || '').replace(/\+/g, ' '),
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

    ui: {
      buildingQuery: query,
      query
    },
    searches: []
  }, document.body
  // jshint ignore:end
);