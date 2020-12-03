var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  SpotifyUserID: { type: String, required: nonEmpty() },
  graphicalPlaylists: [String],
});

function nonEmpty(){
  return typeof this.text === 'string'? false : true;
}

module.exports = mongoose.model('User', UserSchema);
