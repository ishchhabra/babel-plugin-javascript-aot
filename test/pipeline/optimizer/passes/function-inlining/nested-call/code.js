function inner() {
  return 42;
}
function outer() {
  return inner();
}
const a = outer();
