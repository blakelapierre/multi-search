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
    const library = `${reduce.toString()}\n${map.toString()}`;
    function createEvaluator(fn) {
        return new Function(`${library}\n${fn.toString().split('\n').slice(1, -1).join('\n')}`);
    }
    exports.createEvaluator = createEvaluator;
    function reduce(list, fn, initial) {
        return Array.prototype.reduce.call(list, fn, initial);
    }
    function map(list, fn) {
        return Array.prototype.map.call(list, fn);
    }
});

//# sourceMappingURL=createEvaluator.js.map
