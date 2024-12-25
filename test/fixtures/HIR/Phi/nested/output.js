let $p2 = 1;
if (true) {
  let $p0 = 2;
  if (false) {
    const $10 = 3;
    $p0 = $10;
  } else {
    const $13 = 4;
    $p0 = $13;
  }
  $p2 = $p0;
} else {
  let $p1 = 5;
  $p1 = $p1;
  if (true) {
    const $20 = 6;
    $p1 = $20;
  }
  $p2 = $p1;
}
const $1 = $p2;
console.log($1);
