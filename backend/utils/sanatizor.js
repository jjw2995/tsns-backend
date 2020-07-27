const filterObjPropsBy = (obj, keys) => {
	return Object.assign({}, ...keys.map((key) => ({ [key]: obj[key] })));
};

module.exports = {
	filterObjPropsBy,
};
