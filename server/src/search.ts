const puppeteer = require('puppeteer');

import engines from './engines';

const document: any = {};

export default async (query = 'test', partialResults) => {
  const browser = await puppeteer.launch(),
        results = await Promise.all(search(query, browser, partialResults)),
           urls = results.reduce((urls, {name, results}, i) => {
                    return results.reduce((urls, {url}, i) => {
                      (urls[url] = urls[url] || []).push([name, i]);
                      return urls;
                    }, urls);
                  }, {});

  return {urls, results};
};

function search(query, browser, partialResults) {
  return engines.map(async ({name, queryUrl, evaluator}) => {
    const page = await browser.newPage();
    
    // page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));

    await page.goto(`${queryUrl}${encodeURI(query)}`);
    
    const results = await page.evaluate(evaluator);
  
    partialResults({name, results});
  
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