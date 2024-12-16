let x = 1;
if (true) {
  x = 2;
  if (false) {
    x = 3;
  } else {
    x = 4;
  }
} else {
  x = 5;
  if (true) {
    x = 6;
  }
}
const y = x;