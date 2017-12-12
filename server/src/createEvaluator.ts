const library = `${reduce.toString()}\n${map.toString()}`;

function createEvaluator(fn) {
  return new Function(`${library}\n${fn.toString().split('\n').slice(1, -1).join('\n')}`);
}

function reduce(list, fn, initial) {
  return Array.prototype.reduce.call(list, fn, initial);
}

function map(list, fn) {
  return Array.prototype.map.call(list, fn);
}

export {createEvaluator};