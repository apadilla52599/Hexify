var mongoose = require('mongoose');
var TrackSchema = require('./Track').schema;

var ArtistSchema = new mongoose.Schema({
  SpotifyArtistID: {type: String,required: nonEmpty()},
  name: {type: String,required: nonEmpty()},
  q: { type: Number, min: -100, max: 100 },
  r: { type: Number, min: -100, max: 100 },
  tracks: [TrackSchema],
});

function nonEmpty(){
  return typeof this.text === 'string'? false : true;
}

module.exports = mongoose.model('Artist', ArtistSchema);