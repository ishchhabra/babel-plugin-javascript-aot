let x = 10;
let y = 20;
let z;

if (x > 5) {
  if (y < 15) {
    z = x + y;
  } else {
    z = x - y;
  }
} else {
  z = x * y;
}

let result = z * 2;
console.log(result);
