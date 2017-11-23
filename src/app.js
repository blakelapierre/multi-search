import { h, render } from 'preact-cycle';

import searchService from './searchService';

// jshint ignore:start
const SEARCH = ({ui: {buildingQuery}, searches, ...p}, mutation) => ({
  ui: {query: buildingQuery, buildingQuery},
  searches: [searchService(buildingQuery, mutation(ADD_RESPONSE))].concat(searches),
  ...p
});

const ADD_RESPONSE = (_, result) => {
  // mostly a placeholder to trigger a UI update right now...
};

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

const MultiSearch = ({engines, view, ui: {query}}, {searches: [search], mutation}) => (
  // jshint ignore:start
  <multi-search className={{'searched': query}}>
  {console.log(query, search)}
    {query && !search ? mutation(SEARCH, mutation)(query) : undefined}
    <Query />
    <History />
    {view === 'iframe' ? <Engines /> : <Results />}
  </multi-search>
  // jshint ignore:end
);


  // jshint ignore:start
const Query = (_, {ui: {buildingQuery = ''}, mutation}) => (
  <query className={`characters-${Math.min(16, buildingQuery.length)}`}>
    <options>
      {buildingQuery ? <button onClick={mutation(TOGGLE_VIEW)}></button> : undefined}
    </options>
    <form onSubmit={mutation(SEARCH, mutation)} action="javascript:">
      <input placeholder="Enter Query Text" value={buildingQuery} onInput={mutation(QUERY_CHANGED)} tabindex="0" autoFocus />
    </form>
  </query>
);
  // jshint ignore:end

// jshint ignore:start
const History = () => (
  <history>
  </history>
);
// jshint ignore:end

const Engines = (_, {engines}) => (
  // jshint ignore:start
  <engines>
    {engines.map((engine, index) => <Engine engine={engine} index={index} />)}
  </engines>
  // jshint ignore:end
);

const Engine = ({engine: {name, queryUrl}, index}, {ui: {query}, view, mutation}) => (
  // jshint ignore:start
  <engine className={`index-${index}`}>
    <name>{name}</name>
    {queryUrl ? <iframe-container><iframe src={queryUrl + query} frameBorder={0} sandbox="allow-same-origin allow-scripts" /></iframe-container> : undefined}
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