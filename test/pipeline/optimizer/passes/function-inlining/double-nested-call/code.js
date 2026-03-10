function a() {
  return 42;
}
function b() {
  return a();
}
function c() {
  return b();
}
const result = c();
