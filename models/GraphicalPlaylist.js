var mongoose = require('mongoose');

var GraphicalPlaylistSchema = new mongoose.Schema({
  name: String,
  owner: String,
  playlists: [String],
  artists: [Object],
  nodes: [Object],
  genres: [Object],
  lastModified: { type: Date, default: Date.now },
  privacyStatus: String
});

function nonEmpty(){
  return typeof this.text === 'string'? false : true;
}

module.exports = mongoose.model('Graphical Playlist', GraphicalPlaylistSchema);
