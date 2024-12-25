function $0($2) {
  if ($2 <= 1) {
    return 1;
  }
  return $2 * $0($2 - 1);
}
const $1 = $0(5);
console.log($1);
