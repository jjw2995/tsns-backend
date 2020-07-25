const mongoose = require('mongoose');

const relationSchema = new mongoose.Schema({
  users: [
    {
      id: { type: Schema.Types.ObjectId, index: true, required: true },
      status: {
        type: String,
        enum: ['dating', 'friend', 'pending', 'requested', 'blocked'],
        default: 'pending',
      },
      follows: { type: Boolean, default: false },
    },
  ],
});

relationSchema.path('users').validate(function (value) {
  console.log(value.length);
  if (value.length != 2) {
    throw new Error('relation must be between 2 users!');
  }
});

mongoose.model('Relation', relationSchema);
