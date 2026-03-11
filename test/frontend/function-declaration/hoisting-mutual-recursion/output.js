const $0_0 = $1_0(4);
function $1_0($6_0) {
  if ($6_0 === 0) {
    return true;
  }
  return $2_0($6_0 - 1);
}
function $2_0($13_0) {
  if ($13_0 === 0) {
    return false;
  }
  return $1_0($13_0 - 1);
}
