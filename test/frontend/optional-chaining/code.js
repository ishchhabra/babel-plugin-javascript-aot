const obj = { a: { b: 1 } };
const x = obj?.a;
const y = obj?.a?.b;
const z = obj?.[0];
const w = obj?.method();
const v = obj?.a.b;
