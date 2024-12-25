function $0($2) {
  function $3($4) {
    return $4 * 2;
  }
  return $3($2) + $3($2 + 1);
}
const $1 = $0(5);
console.log($1);
