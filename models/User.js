var mongoose = require('mongoose');
var GraphicalPlaylistSchema = require("./GraphicalPlaylist").schema;

var UserSchema = new mongoose.Schema({
  _ID: {type: String,required: nonEmpty()},
  SpotifyUserID: {type: String,required: nonEmpty()},
  graphicalPlaylists: [GraphicalPlaylistSchema],
});

function nonEmpty(){
  return typeof this.text === 'string'? false : true;
}

module.exports = mongoose.model('User', UserSchema);