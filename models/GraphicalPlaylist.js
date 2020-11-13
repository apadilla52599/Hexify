var mongoose = require('mongoose');
var ArtistSchema = require("./Artist").schema;

var GraphicalPlaylistSchema = new mongoose.Schema({
  _ID: {type: String,required: nonEmpty()},
  name: String,
  playlists: [String],
  artists: [ArtistSchema],
  lastModified: Date,
  privacyStatus: String
});

function nonEmpty(){
  return typeof this.text === 'string'? false : true;
}

module.exports = mongoose.model('Graphical Playlist', GraphicalPlaylistSchema);