function outer(x) {
  function inner(y) {
    return y * 2;
  }
  return inner(x) + inner(x + 1);
}

const value = outer(5);
