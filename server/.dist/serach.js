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
    exports.default = (query = 'test', partialResults) => __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch(), results = yield Promise.all(search(query, browser, partialResults)), urls = results.reduce((urls, { name, results }, i) => {
            return results.reduce((urls, { url }, i) => {
                (urls[url] = urls[url] || []).push([name, i]);
                return urls;
            }, urls);
        }, {});
        return { urls, results };
    });
    function search(query, browser, partialResults) {
        return engines_1.default.map(({ name, queryUrl, evaluator }) => __awaiter(this, void 0, void 0, function* () {
            const page = yield browser.newPage();
            // page.on('console', ({args}) => console.log(`${name} console: ${args.join(' ')}`));
            yield page.goto(`${queryUrl}${encodeURI(query)}`);
            const results = yield page.evaluate(evaluator);
            partialResults({ name, results });
            yield page.close();
            return { name, results };
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

//# sourceMappingURL=serach.js.map
