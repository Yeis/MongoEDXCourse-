function   setupAuth(User, app){
 var passport = require('passport');
  var FacebookStrategy = require('passport-facebook').Strategy;

  // High level serialize/de-serialize configuration for passport
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.
      findOne({ _id : id }).
      exec(done);
  });
  //Facebook-specific
  passport.use(new FacebookStrategy(
  {
    clientID:"1602390670070086",
    clientSecret: "a106369b0487bd8f473527f6dd480fdc",
    callbackURL: 'http://localhost:3000/auth/facebook/callback'
  },
  function(accessToken , refreshToken , profile , done){
      if(!profile.emails || !profile.emails.length){
          return done('No emails associated with this account!');
      }
      User.findOneAndUpdate(
          {'data.oauth': profile.id},
          {
            $set : {
            'profile.username' : profile.emails[0].value,
            'profile.picture' : 'http://graph.facebook.com/' + profile.id.toString() + '/picture?type=large'
            }
          },
          { 'new': true , upsert: true , runValidators: true },
          function(error , user){
              done(error , user);
          });
  }));    
    //Express middlewares
    app.use(require('express-session')({
        secret: 'this is a secret'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    //Express routes for auth 
   app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/fail' }),
    function(req, res) {
      res.send('Welcome, ' + req.user.profile.username);
    });

}

module.exports = setupAuth;