function add(...numbers) {
  return numbers.reduce((sum, number) => sum + number, 0);
}

const a = add(1, 2, 3, 4, 5);
