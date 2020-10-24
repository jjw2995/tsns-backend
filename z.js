let a = [
  { a: 1, b: 1 },
  { a: 2, b: 2 },
  { a: 3, b: 3 },
];

// let b = [
//   { a: 1, b: 1 },
//   { a: 2, b: 2 },
//   { a: 3, b: 3 },
// ];

// a.map((r) => {});
// let
a.find((elem) => {
  return (elem.a = 2);
}).a = 6;
// c.a = 5;
// console.log(c);
console.log(a);
