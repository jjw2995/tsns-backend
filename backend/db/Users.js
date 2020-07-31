const mongoose = require('mongoose');
// const filterObjPropsBy = require('../utils/sanatizor');
const uniqueValidator = require('mongoose-unique-validator');
// const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema(
	{
		nickname: { type: String, required: [true, 'cannot be blank'], trim: true },
		birthday: Date,
		email: {
			type: String,
			required: [true, 'email cannot be blank'],
			unique: [true, 'email must be unique'],
			trim: true,
			index: true,
		},
		password: {
			type: String,
			required: true,
		},
		salt: { type: String, required: true },
		refreshToken: { type: String },
	},
	{ timestamps: true }
);

userSchema.plugin(uniqueValidator, { type: 'mongoose-unique-validator' });
// userSchema.plugin(uniqueValidator);

// userSchema.pre('save', function (next) {
// 	this.salt = new String(bcrypt.genSaltSync(10));
// 	this.password = bcrypt.hashSync(this.password, this.salt);
// 	next();
// });

userSchema.set('toJSON', {
	transform: function (doc, ret, options) {
		delete ret.password;
		delete ret.salt;
		delete ret.email;
		delete ret.createdAt;
		delete ret.updatedAt;
		delete ret.__v;
		// return filterObjPropsBy(ret, ['_id', 'nickname', 'refreshToken']);
		// console.log(ret.keyValue('_id'));
		// ret.keyValue('')
		return ret;
	},
});

// userSchema.methods.verifyPassword = (pass) => {
// 	// return function (pass) {
// 	console.log(this);
// 	console.log(this.password);
// 	console.log(pass);
// 	// return bcrypt.compareSync(pass, this.password);
// 	// };
// };

userSchema.methods.toFilteredJSON = function (filters = []) {
	var json = {};
	filters.map((filter) => {
		json[filter] = this[filter];
	});
	return json;
};

userSchema.post('save', function (error, doc, next) {
	// console.log(error);
	if (error.name === 'MongoError' && error.code === 11000) {
		// console.log(Object.keys(error.keyValue));
		next(new Error('There was a duplicate key error'));
	} else {
		// console.log('\n in post save \n');
		next();
	}
});

module.exports = mongoose.model('User', userSchema);

// //////////////////////////////////////////////////////////////////
// // make sure every value is equal to "something"
// function validator (val) {return val == 'something';}
// new Schema({ name: { type: String, validate: validator }});

// // with a custom error message
// var custom = [validator, 'Uh oh, {PATH} does not equal "something".']
// new Schema({ name: { type: String, validate: custom }});

// // adding many validators at a time
// var many = [{ validator: validator, msg: 'uh oh' },
//             { validator: anotherValidator, msg: 'failed' }]
// new Schema({ name: { type: String, validate: many }});

// // or utilizing SchemaType methods directly:
// var schema = new Schema({ name: 'string' });
// schema.path('name').validate(validator,
//   'validation of `{PATH}` failed with value `{VALUE}`');
