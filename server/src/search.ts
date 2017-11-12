const puppeteer = require('puppeteer');

import engines from './engines';

const document: any = {};

// const browserPromise = puppeteer.launch();

// export default class SearchService {
//   pagePoolSize = 5

//   async search (query = 'test', partialResults) {
//     const browser = await browserPromise,
//           start = new Date().getTime(),
//           results = await Promise.all(search(query, browser, partialResults)),
//           end = new Date().getTime(),
//           urls = results.reduce((urls, {name, results}, i) => {
//             return results.reduce((urls, {url}, i) => {
//               (urls[url] = urls[url] || []).push([name, i]);
//               return urls;
//             }, urls);
//           }, {});

//     return {urls, results, start, end};
//   }

//   searchEngines (query, browser, partialResults) {
//     return engines.map(async ({name, queryUrl, evaluator}) => {
//       const page = await browser.newPage();

//       // page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));

//       const start = new Date().getTime();
//       await page.goto(`${queryUrl}${encodeURI(query)}`);
//       const end = new Date().getTime();

//       const results = await page.evaluate(evaluator);

//       partialResults({name, results, start, end});

//       await page.close();

//       return {name, results, start, end};
//     });
//   }
// }


class PagePool {
  size = engines.length * 2

  freePages = []

  reservations = []

  totalPages = 0

  browserPromise

  constructor() {
    this.browserPromise = puppeteer.launch();
  }

  async getPage() {
    const browser = await this.browserPromise;

    let page = this.freePages.pop();

    console.log(page);

    if (page === undefined) {
      console.log(this.totalPages, this.size);
      if (this.totalPages < this.size) {
        this.totalPages++;
        page = await browser.newPage();
      }
      else {
        console.log('waiting');
        page = await this.waitForPage();
      }
    }

    return {
      page,
      release: (page => {
        const next = this.reservations.pop();

        if (next === undefined)
          this.freePages.push(page);
        else
          next(page);

      }).bind(this, page)
    };
  }

  waitForPage() {
    return new Promise((resolve, reject) => {
      this.reservations.push(resolve);
    })
  }
}


const pagePool = new PagePool();

export default async (query = 'test', partialResults) => {
  const start = new Date().getTime(),
        results = await Promise.all(search(query, pagePool, partialResults)),
        end = new Date().getTime(),
        urls = results.reduce((urls, {name, results}, i) => {
          return results.reduce((urls, {url}, i) => {
            (urls[url] = urls[url] || []).push([name, i]);
            return urls;
          }, urls);
        }, {});

  return {urls, results, start, end};
};

function search(query, pagePool, partialResults) {
  return engines.map(async ({name, queryUrl, evaluator}) => {
    const {page, release} = await pagePool.getPage();

    // page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));
    const start = new Date().getTime();
    await page.goto(`${queryUrl}${encodeURI(query)}`);
    const end = new Date().getTime();

    const results = await page.evaluate(evaluator);

    partialResults({name, results, start, end});

    release();

    return {name, results, start, end};
  });
}



// function search(query, browser, partialResults) {
//   return engines.map(async ({name, queryUrl, evaluator}) => {
//     const page = await browser.newPage();

//     // page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));

//     const start = new Date().getTime();
//     await page.goto(`${queryUrl}${encodeURI(query)}`);
//     const end = new Date().getTime();

//     const results = await page.evaluate(evaluator);

//     partialResults({name, results, start, end});

//     await page.close();

//     return {name, results, start, end};
//   });
// }

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