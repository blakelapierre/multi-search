const puppeteer = require('puppeteer');

import engines from './engines';

const document: any = {};

class PagePool {
  size = engines.length * 2

  freePages = []

  reservations = []

  totalPages = 0

  browserPromise

  constructor(browserPromise) {
    this.browserPromise = browserPromise;
  }

  async getPage() {
    const browser = await this.browserPromise;

    let page = this.freePages.pop();

    if (page === undefined) {
      if (this.totalPages < this.size) {
        this.totalPages++;
        page = await browser.newPage();
      }
      else {
        page = await this.waitForPage();
      }
    }

    return {
      page,
      // release() { return (next = this.reservations.pop()) ? this.freePages.push(page) : next(page); }
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
    return new Promise((resolve, reject) => this.reservations.push(resolve));
  }
}

const pagePool = new PagePool(puppeteer.launch());

export default async (query = 'test', partialResults) => {
  const [start, results, end] = await asyncBenchmark(() => Promise.all(search(query, pagePool, partialResults))),
                         urls = (results || [])
                                  .reduce(
                                    (urls, {name, results}, i) =>
                                      (results || []).reduce((urls, {url}, i) => {
                                        (urls[url] = urls[url] || []).push([name, i]);
                                        return urls;
                                      }, urls), {});

  return {query, urls, results, start, end};
};

function search(query, pagePool, partialResults) {
  return engines.map(async ({name, queryUrl, evaluator, cache}) => {
    const cachedValue = cache.retrieve(query);

    if (cachedValue && (cachedValue.start + 60 * 1000) >= new Date().getTime()) {
      partialResults(cachedValue);

      return cachedValue;
    }

    const {page, release} = await pagePool.getPage();

    try {
      const [start, _, end] = await asyncBenchmark(() => page.goto(`${queryUrl}${encodeURI(query)}`));
      try {
        const results = await page.evaluate(evaluator);


        const returnValue = {name, results, start, end};

        partialResults(returnValue);

        cache.put(query, returnValue);

        release();
        return returnValue;
      } catch(e) {console.error(e);}
    } catch(e) {console.error(e);}

    release();
  });
}

const asyncBenchmark = async fn => [new Date().getTime(), await fn(), new Date().getTime()];

const groupBy =
  (list, selector, transform = a => a, groups = {}) =>
    list.reduce((groups, item) => {
      const value = selector(item);
      pushTo(groups, value, transform(value));
      // push((groups[value] = groups[value] || []), transform(item));
      // (groups[value] = groups[value] || []).push(transform(item));
      return groups;
    });

function pushTo(obj, key, item) {
  const stack = (obj[key] = obj[key] || []);

  stack.push(item);

  return stack;
}

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