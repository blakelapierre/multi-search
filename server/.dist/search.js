var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./engines"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const puppeteer = require('puppeteer');
    const engines_1 = require("./engines");
    const document = {};
    class PagePool {
        constructor(browserPromise) {
            this.size = engines_1.default.length * 2;
            this.freePages = [];
            this.reservations = [];
            this.totalPages = 0;
            this.browserPromise = browserPromise;
        }
        getPage() {
            return __awaiter(this, void 0, void 0, function* () {
                const browser = yield this.browserPromise;
                let page = this.freePages.pop();
                if (page === undefined) {
                    if (this.totalPages < this.size) {
                        this.totalPages++;
                        page = yield browser.newPage();
                    }
                    else {
                        page = yield this.waitForPage();
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
            });
        }
        waitForPage() {
            return new Promise((resolve, reject) => this.reservations.push(resolve));
        }
    }
    const pagePool = new PagePool(puppeteer.launch());
    exports.default = (query = 'test', partialResults) => __awaiter(this, void 0, void 0, function* () {
        const start = new Date().getTime(), results = yield Promise.all(search(query, pagePool, partialResults)), end = new Date().getTime(), urls = results.reduce((urls, { name, results }, i) => {
            return results.reduce((urls, { url }, i) => {
                (urls[url] = urls[url] || []).push([name, i]);
                return urls;
            }, urls);
        }, {});
        return { urls, results, start, end };
    });
    function search(query, pagePool, partialResults) {
        return engines_1.default.map(({ name, queryUrl, evaluator }) => __awaiter(this, void 0, void 0, function* () {
            const { page, release } = yield pagePool.getPage();
            // page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));
            const start = new Date().getTime();
            yield page.goto(`${queryUrl}${encodeURI(query)}`);
            const end = new Date().getTime();
            const results = yield page.evaluate(evaluator);
            partialResults({ name, results, start, end });
            release();
            return { name, results, start, end };
        }));
    }
    const groupBy = (list, selector, transform = a => a, groups = {}) => list.reduce((groups, item) => {
        const value = selector(item);
        (groups[value] = groups[value] || []).push(transform(item));
        return groups;
    });
});
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

//# sourceMappingURL=search.js.map
