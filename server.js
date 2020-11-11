const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const https = require('https');
var token = "";

const {mongoUrl} = require('./keys') //This uses admin cluster key
const { MongoClient } = require("mongodb");
const client = new MongoClient(mongoUrl);

const dbName = "Hexify";
                      
 async function run() {
    try {
         await client.connect();
         console.log("Connected correctly to server");
         const db = client.db(dbName);
         const col = db.collection("data");
                                                                                                                                                          
         let graphicalPlaylist = {
          "spotifyUserId": "wizzler",
          "graphicalPlaylists": [
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "My favorite graph",
              "tags": [{"value": "Rock", "title": "Rock"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public", 
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "My second favorite graph",
              "tags": [{"value": "Pop", "title": "Pop"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "human music",
              "tags": [{"value": "2000's", "title": "2000's"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "road trip playlist",
              "tags": [{"value": "indie", "title": "indie"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "gaming playlist",
              "tags": [{"value": "Lofi", "title": "Lofi"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "playlist to provoke deep thought in the shower",
              "tags": [{"value": "Pop  Rock  Indie", "title": "Pop  Rock  Indie"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "artists I hate",
              "tags": [{"value": "Trash", "title": "Trash"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            },
            {
              "_id": "5099803df3f4948bd2f98391",
              "name": "artists that inspire me to be uninspired",
              "tags": [{"value": "Screamo", "title": "Screamo"}],
              "dateModified": "Jun 23, 1912",
              "graphThumbnail": "https://f4.bcbits.com/img/a4079823910_10.jpg",
              "visibility": "public",  
              "spotifyPlaylistIds": [
                "59ZbFPES4DQwEjBpWHzrtC",
                "J0sBjDrqHyg8sBjDrqHygGUX"
              ]
            }
          ]
         }

         const p = await col.insertOne(graphicalPlaylist);
         const myUser = await col.findOne();
         console.log(myUser);
        } catch (err) {
         console.log(err.stack);
     }
 
     finally {
        await client.close();
    }
}

run().catch(console.dir);

app.use(express.static(path.join(__dirname, 'build')));

passport.use(
  new SpotifyStrategy(
    {
      clientID: "c0ed6811aa0f4bcaaf430e3659be4d57",
      clientSecret: "b1144988d7c248bcb2cf490f52435645",
      callbackURL: 'http://localhost:8080/auth/spotify/callback'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
        token = accessToken;
        console.log(accessToken);
      /*User.findOrCreate({ spotifyId: profile.id }, function(err, graphicalPlaylist) {
      });*/
      return done();
    }
  )
);

app.get('/auth/spotify', passport.authenticate('spotify'), function(req, res) {
  // The request will be redirected to spotify for authentication, so this
  // function will not be called.
});

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.get('/v1*', function (req, res) {
    const options = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    };

    /*https.request("https://api.spotify.com" + req.originalUrl, options).on('response', (response) => {
        console.log(response.statusCode);
        response.pipe(res);
    });*/
    https.get("https://api.spotify.com" + req.originalUrl, options, (spotifyRes) => {
        console.log('statusCode:', spotifyRes.statusCode);
        console.log('headers:', spotifyRes.headers);
            spotifyRes.pipe(res);

        /*spotifyRes.on('data', (d) => {
            //return res.send(d);
            spotifyRes.pipe(res);
        });*/
    });
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
