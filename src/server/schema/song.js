const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
  song: {
    name: String,
    artist: String,
    img: String
  },
  votes: [{voter: String, upvote: Boolean}],
  createdAt: {type: Date, default: Date}
});

module.exports = mongoose.model('Song', songSchema);