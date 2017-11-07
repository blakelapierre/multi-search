const puppeteer = require('puppeteer');

import engines from './engines';

const document: any = {};

export default async () => {
  const browser = await puppeteer.launch();

  await Promise.all(search('test', browser));
};

function search(query, browser) {
  return engines.map(async ({name, queryUrl, evaluator}) => {
    const page = await browser.newPage();
    
    page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));

    await page.goto(`${queryUrl}${encodeURI(query)}`);
    
    const results = await page.evaluate(evaluator);
  
    const resultsToPrint = 2;
    console.log(`${name}\n`);
    if (results) console.log(`  ${results.slice(0, resultsToPrint).map(result => `${result.titles[0]} (${result.url})\n    ${result.snippet}`).join('\n\n  ')}\n`);
  
    await page.close();
  });
}