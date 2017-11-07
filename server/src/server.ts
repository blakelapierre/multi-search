const puppeteer = require('puppeteer');

import engines from './engines';

const document: any = {};

export default async () => {
  const browser = await puppeteer.launch();

  const results = await Promise.all(search('test', browser));

  
  const urls = results.reduce((urls, {name, results}, i) => {
    return results.reduce((urls, {url}, i) => {
      (urls[url] = urls[url] || []).push([name, i]);
      return urls;
    }, urls);
  }, {});

  console.log(urls);
};

function search(query, browser) {
  return engines.map(async ({name, queryUrl, evaluator}) => {
    const page = await browser.newPage();
    
    page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));

    await page.goto(`${queryUrl}${encodeURI(query)}`);
    
    const results = await page.evaluate(evaluator);
  
    const resultsToPrint = 2;
    console.log(`${name} (${results.length} total results [showing first ${resultsToPrint}]):\n`);
    if (results) console.log(`  ${results.slice(0, resultsToPrint).map(result => `${result.titles[0]} (${result.url})\n    ${result.snippet}`).join('\n\n  ')}\n`);
  
    await page.close();

    return {name, results};
  });
}

const groupBy = (list, selector, transform = a => a, groups = {}) => list.reduce((groups, item) => {
  const value = selector(item);
  (groups[value] = groups[value] || []).push(transform(item));
  return groups;
})

// function groupBy(list, property) {
//   return list.reduce((groups, item) => {
//     const value = selector(item);
//     (groups[value] = groups[value] || []).push(transform(item))
//   });
//   return list.reduce((groups, item) => {
//     (groups[property] = groups[property] || []).push(item);
//     return groups;
//   }, {});
// }