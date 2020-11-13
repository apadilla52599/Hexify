var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
  SpotifyTrackID: {type: String,required: nonEmpty()},
  name: {type: String,required: nonEmpty()},
});

function nonEmpty(){
  return typeof this.text === 'string'? false : true;
}

module.exports = mongoose.model('Track', TrackSchema);