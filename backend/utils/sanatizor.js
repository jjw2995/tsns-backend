const filterObjPropsBy = (obj, keys) => {
	// console.log(obj, '\n');
	return Object.assign({}, ...keys.map((key) => ({ [key]: obj[key] })));
};

module.exports = {
	filterObjPropsBy,
};
