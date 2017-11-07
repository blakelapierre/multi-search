const puppeteer = require('puppeteer');

const document: any = {};

// jshint ignore:start
export default async () => {
  const browser = await puppeteer.launch(),
        page = await browser.newPage();

  await page.goto('https://duckduckgo.com/?q=test');
  
  const results = await page.evaluate(() => {
    const results = document.querySelectorAll('#links.results > .result.results_links_deep');

    return Array.prototype.reduce.call(results, (agg, result, i) => agg.concat({
      // html: result.innerHTML,
      title: Array.prototype.reduce.call(result.querySelectorAll('.result__title > *:not(.result__check)'), (agg, result, i) => agg.concat(result.innerHTML), []),
      snippet: result.querySelector('.result__snippet').innerHTML,
      url: result.querySelector('.result__url').getAttribute('href')
    }), []);
  });

  console.log('results', results.map(result => `${result.title[0]} (${result.url})\n  ${result.snippet}`).join('\n\n'));
};
// jshint ignore:end