let obj = {};
({ a: obj.a, b: obj.b } = { a: 1, b: 2 });
console.log(obj.a, obj.b);
