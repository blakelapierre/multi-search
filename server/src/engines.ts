class Engine {
  constructor(public name, public queryUrl, public evaluator) { }
}

const Google = new Engine('Google','https://google.com/search?q=', googleEvaluator),
      DuckDuckGo = new Engine('DuckDuckGo', 'https://duckduckgo.com?q=', duckduckgoEvaluator),
      Bing = new Engine('Bing', 'https://bing.com?q=', bingEvaluator),
      Yahoo = new Engine('Yahoo', 'https://search.yahoo.com/search?p=', yahooEvaluator),

      engines = [ Google, DuckDuckGo, Bing, Yahoo ];

function googleEvaluator() {
  const results = document.querySelectorAll('.srg > .g');

  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('.r'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: result.querySelector('.rc .s .st').innerText,
    url: result.querySelector('.rc .r a').getAttribute('href')
  }), []);
}

function duckduckgoEvaluator() {
  const results = document.querySelectorAll('#links.results > .result.results_links_deep');
  
  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('.result__title > *:not(.result__check)'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: result.querySelector('.result__snippet').innerText,
    url: result.querySelector('.result__url').getAttribute('href')
  }), []);
}

function bingEvaluator() {
  const results = document.querySelectorAll('#b_results .b_algo');
  
  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('h2 > a'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: (result.querySelector('.b_caption p') || {}).innerText,
    url: result.querySelector('h2 > a').getAttribute('href')
  }), []);
}

function yahooEvaluator() {
  const results = document.querySelectorAll('.dd.algo.algo-sr');
  
  return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
    titles: Array.prototype.reduce.call(result.querySelectorAll('.title > a'), (agg, result, i) => agg.concat(result.innerText), []),
    snippet: (result.querySelector('.compText p') || {}).innerText,
    url: result.querySelector('.title > a').getAttribute('href')
  }), []);
}

export default engines;