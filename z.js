// const { Storage } = require('@google-cloud/storage');

// const storage = new Storage();
// storage.bucket();

let a = [
	{ a: 1, b: 2 },
	{ a: 1, b: 3 },
];
let b = a.map((e) => {
	return e.b;
});

console.log(a);
