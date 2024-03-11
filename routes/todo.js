const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the todo schema
const todoSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  currentDateAndTime: {
    type: Date,
    default: Date.now,
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Create the Todo model
module.exports = mongoose.model('Todo', todoSchema);
