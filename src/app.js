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

const TOGGLE_URL = (_, url) => {
  if (_.selectedURLs[url] === undefined) _.selectedURLs[url] = true;
  else delete _.selectedURLs[url];
};

// jshint ignore:start
const SET_HIGHLIGHT_URL = (_, url) => {
  _.highlightUrl = url;
};
// jshint ignore:end


const OPEN_URLS = (urls) => {
  console.log('urls', urls);
  urls.forEach(url => {
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = url;
    a.click();
    console.log(url);
  });
};

const MultiSearch = ({engines, view, ui: {query}}, {searches: [search], mutation}) => (
  // jshint ignore:start
  <multi-search className={{'searched': query}}>
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
      <input placeholder="Enter Query Text" value={buildingQuery} onInput={mutation(QUERY_CHANGED)} autoFocus />
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

// jshint ignore:start
const Results = (_, {searches: [search], config: {resultsView}}) => search ? (
  <results>
    {resultsView === 'byEngine' ? <ResultsByEngine /> : <ResultsByURL />}
    <sidebar>
      <SelectedURLs />
      <Top />
    </sidebar>
  </results>
) : undefined;
// jshint ignore:end

// jshint ignore:start
const ResultsByEngine = (_, {searches: [search], highlightUrl, mutation}) => (
  <results-by-engine>
    {search.responses.map((response, i) => <EngineResults {...response} i={i} search={search} />)}
  </results-by-engine>
);
// jshint ignore:end

// jshint ignore:start
const ResultsByURL = (_, {searches: [search], highlightUrl, mutation}) => (
  <results-by-url>
    {Object.values(
      search.responses.reduce(
        (agg, {name, results}, i) =>
          results.reduce((agg, result) =>
            (agg[url] = agg[url] || {url, results: []}).results.push({name, result}), agg), {}))
     .map(({url, results}) => (
      <span>{url}</span>
     ))}
  </results-by-url>
);
// jshint ignore:end

// jshint ignore:start
const EngineResults = ({name, results, start, end, sliceStart = 0, sliceEnd = 3, i, search: {responses}, query}, {mutation, engines}) => (
  <result>
    <engine>
      <a href={engines.map(({name: engineName, queryUrl}) => name === engineName ? `${queryUrl}${query}` : undefined).join('')}><img src={`//${name}.com/favicon.ico`} class="engine-icon" /></a>
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

function combine(mutation, ...ms) {
  const fns = ms.map(([...m]) => mutation(...m));
  return (...args) => {
    return fns.map(fn => fn(...args));
  };
}

  // <item onMouseOver={mutation(SET_HIGHLIGHT_URL, url)} className={{'highlight': url === highlightUrl}}>
const Result = ({titles, snippet, url, images}, {highlightUrl, selectedURLs, mutation}) => (
  // jshint ignore:start
  <item
    onMouseOver={mutation(SET_HIGHLIGHT_URL, url)}
    className={{'highlight': url === highlightUrl, 'selected': selectedURLs[url]}}>
    <input type="checkbox" checked={selectedURLs[url]} onClick={mutation(TOGGLE_URL, url)} />
    <a href={url}>{titles[0]}</a>
    <div>
      {images && images.length > 0 ? images.map(({src, height, width}) => <img src={src} width={width} height={height} />) : undefined}
      <snippet>{snippet}</snippet>
    </div>
  </item>
  // jshint ignore:end
);

const SelectedURLs = (_, {selectedURLs, mutation}) => (
  // jshint ignore:start
  <selected>
    <urls>
      {Object.keys(selectedURLs).map(url =>(
        <div>
          <input type="checkbox" checked={true} onClick={mutation(TOGGLE_URL, url)} />
          <a href={url}>{url}</a>
        </div>
      ))}
    </urls>

    {Object.keys(selectedURLs).length > 0 ? <button onClick={() => OPEN_URLS(Object.keys(selectedURLs))}>^ Open URLs ^</button> : undefined}
  </selected>
  // jshint ignore:end
);

const Top = (_, {searches: [{responsesByEngineName, top}], highlightUrl, mutation}) => (
  // jshint ignore:start
  <top>
    {top ? (
      <urls>
        {top.map(([url, positions]) => (
          <url title={positions.map(([engine, index]) => `${engine}: ${responsesByEngineName[engine].results[index].snippet}`).concat(url).join('\n\n')}
               onMouseOver={mutation(SET_HIGHLIGHT_URL, url)}
               className={{'highlight': url === highlightUrl}}>
            <EngineIcons engines={positions} />
            <a href={url}>{url.slice(0, Math.min(80, url.length))}{url.length > 75 ? '...' : ''}</a>
          </url>))}</urls>) : undefined}
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

const engines = [{
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
}];

const engineMap = engines.reduce((agg, engine) => {
  agg[engine.name] = engine;
  return agg;
}, {});

render(
  // jshint ignore:start
  MultiSearch, {
    // enteredQuery: decodeURIComponent(window.location.search.substr(1).split('=')[1] || '').replace(/\+/g, ' '),
    engines,
    engineMap,

    ui: {
      buildingQuery: query,
      query
    },

    config: {
      resultsView: 'byEngine' // 'byEngine' | 'byURL'
      // resultsView: 'byURL' // 'byEngine' | 'byURL'
    },

    selectedURLs: {},

    searches: []
  }, document.body
  // jshint ignore:end
);