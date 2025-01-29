let obj = { nested: { value: 1 } };
({ value: obj.nested.value } = { value: 2 });
console.log(obj.nested.value);
