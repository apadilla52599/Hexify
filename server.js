const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

var schema = require('./graphql/hexifySchemas');
const { graphqlHTTP } = require('express-graphql');

const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const https = require('https');
var token = "";

const {mongoUrl} = require('./keys') //This uses admin cluster key
const { MongoClient } = require("mongodb");
const { parseConfigFileTextToJson } = require('typescript');
const client = new MongoClient(mongoUrl);

const dbName = "Hexify";
                      
async function signIn(profile) {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);
        const col = db.collection("users");
        var user= await col.findOne({ "spotifyUserId": profile.id });
        if(user==null){//creates new user
          let newUser = {"spotifyUserId":  profile.id,"graphicalPlaylists": []}
          user = await (await col.insertOne(newUser)).ops;
          console.log("User Created: ",user);
        }else{
          console.log("User Found: ",user);
        }
        
      } catch (err) {
        console.log(err.stack);
    }
    finally {
      await client.close();
  }
}

app.use(express.static(path.join(__dirname, 'build')));


app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: global,
  graphiql: true,
}));

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
        signIn(profile);
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
    console.log(req.originalUrl);
    const options = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        }
    };

    https.get("https://api.spotify.com" + req.originalUrl, options, (spotifyRes) => {
        console.log('url: ', req.originalUrl);
        console.log('statusCode: ', spotifyRes.statusCode);
        if (spotifyRes.statusCode === 429)
            console.log(spotifyRes);
        spotifyRes.pipe(res);
    });
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
