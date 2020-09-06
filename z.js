log = (...args) => {
	args.forEach((el) => {
		console.log(el, '\n');
	});
};
let date = new Date();
log(date.getTime());

log(Date.now());
