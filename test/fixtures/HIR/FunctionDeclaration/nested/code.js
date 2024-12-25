function sumOfSquares(a, b) {
  function square(a) {
    return a * a;
  }

  return square(a) + square(b);
}

console.log(sumOfSquares(1, 2));
