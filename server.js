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
app.use('/static', express.static(path.join(__dirname, '/build/static')));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'HMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/graphql', function(req, res, next) {
    let id = "";
    if (req.user !== undefined)
        id = req.user.id;
    graphqlHTTP({
      schema: schema,
      rootValue: global,
      graphiql: true,
      context: id
    })(req, res);
});

app.use(function (req, res, next) {
  if (req.user === undefined && req.session.tempToken) {
    req.user = { accessToken: req.session.tempToken };
  }
  console.log(req.user);
  next()
})

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
app.get('/auth/spotify', passport.authenticate('spotify', {
    scope: ['streaming', 'user-read-email', 'user-read-private', 'playlist-modify-public','playlist-modify-private']
  }), function(req, res) {
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
app.get('/auth/temp/:token', function (req, res) {
  //console.log(req.params.token);
  req.session.tempToken = req.params.token;
  return res.redirect('/');
});

app.get('/auth/token', function (req, res) {
  if (req.user === undefined || req.user.accessToken === undefined)
    res.json({ token: "" });
  else
    res.json({ token: req.user.accessToken });
});

app.get('/logout', function(req, res){
  console.log("should log out");
  req.logout();
  res.redirect('/browse');
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
  if (req.user === undefined) {
    res.redirect('/auth/spotify');
  }
  else {
    res.sendFile(path.join(__dirname, '/build/index.html'));
  }
});

app.listen(process.env.PORT || 8080);
