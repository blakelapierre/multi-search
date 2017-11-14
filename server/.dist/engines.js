(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Engine {
        constructor(name, queryUrl, evaluator) {
            this.name = name;
            this.queryUrl = queryUrl;
            this.evaluator = evaluator;
        }
    }
    const Google = new Engine('Google', 'https://google.com/search?q=', googleEvaluator), DuckDuckGo = new Engine('DuckDuckGo', 'https://duckduckgo.com?q=', duckduckgoEvaluator), Bing = new Engine('Bing', 'https://bing.com?q=', bingEvaluator), Yahoo = new Engine('Yahoo', 'https://search.yahoo.com/search?p=', yahooEvaluator), engines = [Google, DuckDuckGo, Bing, Yahoo];
    function googleEvaluator() {
        const results = document.querySelectorAll('.srg > .g');
        return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
            titles: Array.prototype.reduce.call(result.querySelectorAll('.r'), (agg, result, i) => agg.concat(result.innerText), []),
            snippet: result.querySelector('.rc .s .st').innerText,
            url: result.querySelector('.rc .r a').getAttribute('href'),
            images: Array.prototype.map.call(result.querySelectorAll('img'), r => ({ src: r.getAttribute('src'), width: r.getAttribute('width'), height: r.getAttribute('height') }))
        }), []);
    }
    function duckduckgoEvaluator() {
        const results = document.querySelectorAll('#links.results > .result.results_links_deep');
        return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
            titles: Array.prototype.reduce.call(result.querySelectorAll('.result__title > *:not(.result__check)'), (agg, result, i) => agg.concat(result.innerText), []),
            snippet: result.querySelector('.result__snippet').innerText,
            url: result.querySelector('.result__url').getAttribute('href'),
            images: Array.prototype.map.call(result.querySelectorAll('img:not(.result__icon__img)'), r => ({ src: (r.getAttribute('src') || '').replace(/^\/[^\/]/, 'http://duckduckgo.com/'), width: r.getAttribute('width'), height: r.getAttribute('height') }))
        }), []);
    }
    function bingEvaluator() {
        const results = document.querySelectorAll('#b_results .b_algo');
        return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
            titles: Array.prototype.reduce.call(result.querySelectorAll('h2 > a'), (agg, result, i) => agg.concat(result.innerText), []),
            snippet: (result.querySelector('.b_caption p') || {}).innerText,
            url: result.querySelector('h2 > a').getAttribute('href'),
            images: Array.prototype.map.call(result.querySelectorAll('img'), r => ({ src: (r.getAttribute('src') || '').replace(/^\/[^\/]/, 'https://www.bing.com/'), width: r.getAttribute('width'), height: r.getAttribute('height') }))
        }), []);
    }
    function yahooEvaluator() {
        const results = document.querySelectorAll('.dd.algo.algo-sr');
        return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
            titles: Array.prototype.reduce.call(result.querySelectorAll('.title > a'), (agg, result, i) => agg.concat(result.innerText), []),
            snippet: (result.querySelector('.compText p') || {}).innerText,
            url: result.querySelector('.title > a').getAttribute('href'),
            images: Array.prototype.map.call(result.querySelectorAll('img'), r => ({ src: r.getAttribute('src'), width: r.getAttribute('width'), height: r.getAttribute('height') }))
        }), []);
    }
    exports.default = engines;
});

//# sourceMappingURL=engines.js.map
