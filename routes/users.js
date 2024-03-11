const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/todo");

const Schema = mongoose.Schema;


const userSchema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    
  },
  password: {
    type: String
  },
});

userSchema.plugin(plm, {
  usernameField: 'email', 
});
module.exports = mongoose.model('User', userSchema);


