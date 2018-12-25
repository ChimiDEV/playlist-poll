const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
  songID: String,
  song: {
    title: String,
    artist: String,
    albumTitle: String,
    img: String,
    playURL: String,
    duration: Number
  },
  votes: [{ voter: String, upvote: Boolean }],
  creator: String,
  createdAt: { type: Date, default: Date }
});

module.exports = mongoose.model('Song', songSchema);
