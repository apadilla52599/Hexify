const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const https = require('https');
var token = "";

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
      /*User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
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
    console.log(req.originalUrl);
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
