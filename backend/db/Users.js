const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: [true, 'cannot be blank'], trim: true },
    birthday: Date,
    email: {
      type: String,
      required: [true, 'email cannot be blank'],
      unique: [true, 'email must be unique'],
      trim: true,
    },
    password: {
      type: String,
    },
    salt: { type: String, required: true },
  },
  { timestamps: true },
);

// userSchema.plugin(uniqueValidator);
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