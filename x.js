// module.exports = class Test {
// 	constructor(params) {
// 		this.params = params;
// 	}
// 	pr() {
// 		console.log(this.params);
// 	}
// };

// exports = { Test };
// let t = new Test('asfasd');
// t.pr();

let a = () => new Promise((resolve, reject) => {
	resolve(console.log('in promise a'))
})
// function
let b = () => new Promise((resolve, reject) => {
	resolve(console.log('in promise b'))
})
// a().then(b().then(console.log('works')))

// a().then(() => { b().then(console.log('works')) })


