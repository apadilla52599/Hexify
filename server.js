const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const session = require('express-session')
const schema = require('./graphql/hexifySchemas');
const userSchema = require('./models/User.js').schema;
const UserModel = mongoose.model('User', userSchema);
const { graphqlHTTP } = require('express-graphql');

const passport = require('passport')
const SpotifyStrategy = require('passport-spotify').Strategy;
const https = require('https');

mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb+srv://hexify_admin:DVX0kU3D8VlFKGwC@hexify.cxa7e.mongodb.net/test?retryWrites=true&w=majority", { promiseLibrary: require('bluebird'), useNewUrlParser: true })
  .then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));

/* Middleware */
app.use(express.static(path.join(__dirname, 'build')));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: global,
  graphiql: true,
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(
  new SpotifyStrategy(
    {
      clientID: "c0ed6811aa0f4bcaaf430e3659be4d57",
      clientSecret: "b1144988d7c248bcb2cf490f52435645",
      callbackURL: 'http://localhost:8080/auth/spotify/callback'
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      UserModel.findOne({ SpotifyUserID: profile.id }, function(err, obj) {
        if (obj === null) {
          console.log("user did not exist");
          const newUser = new UserModel({
            SpotifyUserID: profile.id,
            graphicalPlaylists: []
          });
          newUser.save(function (err) {
            if (err) console.error(err);
          });
        }
        else {
          console.log("user already exists");
        }
      });
      return done(null, { id: profile.id, accessToken: accessToken });
    }
  )
);

/* Routes */
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

// TODO: This no longer works
app.get('/auth/temp', function (req, res) {
  return res.redirect('/');
});

app.get('/v1*', function (req, res) {
  let options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + req.user.accessToken
    }
  };
  console.log("url: " + req.originalUrl);
  let sendReq = () => https.get("https://api.spotify.com" + req.originalUrl, options, (spotifyRes) => {
    if (spotifyRes.statusCode === 429) {
      console.log("Too many requests, try again in " + spotifyRes.headers['retry-after']);
      setTimeout(sendReq, parseInt(spotifyRes.headers['retry-after']));
    }
    else {
      spotifyRes.setEncoding('utf8');
      let rawData = '';
      spotifyRes.on('data', (chunk) => { rawData += chunk; });

      spotifyRes.on('end', () => {
        res.json(JSON.parse(rawData));
      });
    }
  });
  sendReq();
});

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
