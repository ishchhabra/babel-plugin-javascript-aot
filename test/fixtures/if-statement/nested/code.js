const value = 100;
if (value > 50) {
  const threshold = 75;
  if (threshold > value) {
    const result = threshold + 10;
  } else {
    const result = value - 5;
  }
} else {
  const minimum = 25;
  if (minimum < value) {
    const result = minimum * 2;
  } else {
    const result = minimum / 2;
  }
}
const finalValue = value;
