function $0($3) {
  if ($3 === 0) {
    return true;
  }
  return $1($3 - 1);
}
function $1($14) {
  if ($14 === 0) {
    return false;
  }
  return $0($14 - 1);
}
const $2 = $0(4);
console.log($2);
