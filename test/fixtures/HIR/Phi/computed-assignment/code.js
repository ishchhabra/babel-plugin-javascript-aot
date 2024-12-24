let x = 1;
if (true) {
  let temp = 5;
  temp = temp * 2;
  x = temp + 1; // x will be 11
} else {
  let temp = 3;
  temp = temp + 7;
  x = temp - 2; // x would be 8
}
const y = x;
console.log(y);
