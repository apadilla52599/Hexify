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
      console.log(profile.id);
      UserModel.findOne({ SpotifyUserID: profile.id }, function(err, obj) {
        if (obj === null) {
          console.log("user did not exist");
          const newUser = new UserModel({
            SpotifyUserID: profile.id,
            graphicalPlaylists: []
          });
          newUser.save(function (err) {
            if (err) console.error(err);
              console.log("saved!");
          });
        }
        else {
          console.log("user already exists");
          console.log(obj);
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
    token = req.query.token;
    return res.redirect('/');
});

app.get('/v1*', function (req, res) {
  console.log("hello");
  console.log(req.user);
  console.log(req.user.accessToken);
  const options = {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + req.user.accessToken
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
    //console.log(req.user);
    //console.log(req.session);
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
