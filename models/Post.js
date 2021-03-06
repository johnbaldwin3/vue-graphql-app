const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  categories: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // property ('createdBy') === path
  // ref ('User') === model
  createdDate: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  messages: [{
    messageBody: {
      type: String,
      required: true
    },
    messageDate: {
      type: Date,
      default: Date.now
    },
    messageUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }]
});

// Create index to search on all fields of posts
PostSchema.index({
  // search through all fields = '$**'
  '$**': 'text'
})
module.exports = mongoose.model('Post', PostSchema);