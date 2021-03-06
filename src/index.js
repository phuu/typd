/**
 * Create a typed function. Takes a list of 'checks' and a final callback that is being guarded.
 *
 * Returns a function.
 */
function Typd(...args) {
  const fn = args[args.length - 1];
  const checks = args.slice(0, args.length - 1);
  return function (...innerArgs) {
    checks.forEach(([argName, check], i) => {
      try {
        check(innerArgs[i]);
      } catch (e) {
        throw new Error(`${e.message.replace(/MATCH/g, argName)}`);
      }
    });
    return fn.call(this, ...innerArgs);
  };
}

Typd.any = (MATCH: any) => {};
Typd.none = (MATCH: void) => {};
Typd.boolean = (MATCH: boolean) => {};
Typd.Boolean = (MATCH: Boolean) => {};
Typd.string = (MATCH: string) => {};
Typd.String = (MATCH: String) => {};
Typd.number = (MATCH: number) => {};
Typd.Number = (MATCH: Number) => {};
Typd.Object = (MATCH: Object) => {};

Typd.function = arg => {
  if (typeof arg !== 'function') {
    throw new Error(`Value of argument 'MATCH' violates contract, expected function.`);
  }
};

Typd.ArrayOf = check => (arr: Array<any>) => {
  if (!Array.isArray(arr)) {
    throw new Error('Argument is not an Array');
  }
  arr.forEach(v => check(v));
};

Typd.arrayOf = Typd.ArrayOf;

Typd.oneOf = (...checks) => v => {
  var result = checks.some(check => {
    try {
      check(v);
      return true;
    } catch (e) {}
  });
  if (!result) {
    throw new Error('Argument was not one of supplied types');
  }
};

Typd.optionalOf = check => v => {
  if (typeof v !== 'undefined') {
    check(v);
  }
};

Typd.maybe = Typd.optionalOf;

Typd.shape = (shape: Object) => (value: Object) => {
  const allKeys = Object.keys(shape).concat(Object.keys(value));
  const keys = Object.keys(allKeys.reduce(
    (acc, k) => ({
      ...acc,
      [k]: true
    }),
    {}
  ));

  const result = keys.every(key => {
    if (!shape.hasOwnProperty(key) || !value.hasOwnProperty(key)) {
      return false;
    }
    try {
      shape[key](value[key]);
    } catch (e) {
      return false;
    }
    return true;
  });
  if (!result) {
    throw new Error(`Argument 'MATCH' not match required shape`);
  }
};

module.exports = Typd;
