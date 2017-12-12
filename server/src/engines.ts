import {createEvaluator} from './createEvaluator';

class Engine {
  constructor(public name, public queryUrl, public evaluator) { }

  private _cache = new Cache();

  get cache() {
    return this._cache;
  }
}

class Cache {
  private store = {};

  retrieve(key) {
    return this.store[key];
  }

  put(key, data) {
    return this.store[key] = data;
  }
}
//                                        v compiler trick!
const googleEvaluator = createEvaluator(({map, reduce}) => {
  const results = document.querySelectorAll('.srg > .g');

  return reduce(results, (agg, result, i) => agg.concat({
    titles: reduce(result.querySelectorAll('.r'), (agg, result, i) => agg.concat(result.innerText || 'ERROR: NO INNER TEXT!!!'), []),
    snippet: result.querySelector('.rc .s .st').innerText,
    url: result.querySelector('.rc .r a').getAttribute('href'),
    images: map(result.querySelectorAll('img'), r => ({src: r.getAttribute('src'), width: r.getAttribute('width'), height: r.getAttribute('height')}))
  }), []);
});

const duckduckgoEvaluator = createEvaluator(({map, reduce}) => {
  const results = document.querySelectorAll('#links.results > .result.results_links_deep');

  return reduce(results, (agg, result, i) => agg.concat({
    titles: reduce(result.querySelectorAll('.result__title > *:not(.result__check)'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: result.querySelector('.result__snippet').innerText,
    url: result.querySelector('.result__url').getAttribute('href'),
    images: map(result.querySelectorAll('img:not(.result__icon__img)'), r => ({src: (r.getAttribute('src') || '').replace(/^\/[^\/]/, 'http://duckduckgo.com/'), width: r.getAttribute('width'), height: r.getAttribute('height')}))
  }), []);

  function reduce(list, fn, initial) {
    return Array.prototype.reduce.call(list, fn, initial);
  }
});

const bingEvaluator = createEvaluator(({map, reduce}) => {
  const results = document.querySelectorAll('#b_results .b_algo');

  return reduce(results, (agg, result, i) => agg.concat({
    titles: reduce(result.querySelectorAll('h2 > a'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: (result.querySelector('.b_caption p') || {}).innerText,
    url: result.querySelector('h2 > a').getAttribute('href'),
    images: map(result.querySelectorAll('img'), r => ({src: (r.getAttribute('src') || '').replace(/^\/[^\/]/, 'https://www.bing.com/'), width: r.getAttribute('width'), height: r.getAttribute('height')}))
  }), []);

  function reduce(list, fn, initial) {
    return Array.prototype.reduce.call(list, fn, initial);
  }
});

const yahooEvaluator = createEvaluator(({map, reduce}) => {
  const results = document.querySelectorAll('.dd.algo.algo-sr');

  return reduce(results, (agg, result, i) => agg.concat({
    titles: reduce(result.querySelectorAll('.title > a'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: (result.querySelector('.compText p') || {}).innerText,
    url: result.querySelector('.title > a').getAttribute('href'),
    images: map(result.querySelectorAll('img'), r => ({src: r.getAttribute('src') , width: r.getAttribute('width'), height: r.getAttribute('height')}))
  }), []);

  function reduce(list, fn, initial) {
    return Array.prototype.reduce.call(list, fn, initial);
  }
});

const Google = new Engine('Google','https://google.com/search?q=', googleEvaluator),
      DuckDuckGo = new Engine('DuckDuckGo', 'https://duckduckgo.com?q=', duckduckgoEvaluator),
      Bing = new Engine('Bing', 'https://bing.com?q=', bingEvaluator),
      Yahoo = new Engine('Yahoo', 'https://search.yahoo.com/search?p=', yahooEvaluator),

      engines = [ Google, DuckDuckGo, Bing, Yahoo ];

export default engines;
