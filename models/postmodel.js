const mongoose = require('mongoose');


const postSchenma = new mongoose.Schema({
  postdata: String,
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }

})

const Posts = mongoose.model('post', postSchenma);

module.exports = Posts;