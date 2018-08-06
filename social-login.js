/* Passport Middlewares */
var passport 			= require('passport');
var YoutubeStrategy 	= require('passport-youtube-v3').Strategy;
var FacebookStrategy 	= require('passport-facebook').Strategy;
var TwitterStrategy 	= require('passport-twitter').Strategy;
// var GoogleStrategy 		= require('passport-google').Strategy;
var GoogleStrategy 		= require('passport-google-oauth20').Strategy;
var GitHubStrategy 		= require('passport-github').Strategy;
var LinkedInStrategy 	= require('passport-linkedin').Strategy;
var InstagramStrategy 	= require('passport-instagram').Strategy;
var AmazonStrategy 		= require('passport-amazon').Strategy;
var dropBoxStrategy 	= require('passport-dropbox-oauth2').Strategy;
var FoursquareStrategy 	= require('passport-foursquare').Strategy;
var ImgurStrategy 		= require('passport-imgur').Strategy;
var MeetupStrategy 		= require('passport-meetup').Strategy;
var WordpressStrategy 	= require('passport-wordpress').Strategy;
var TumblrStrategy 		= require('passport-tumblr').Strategy;

/* Misc */
var toolset 	= require('toolset');
var _ 			= require('underscore');




var socialLoginClass = function(options) {
	var scope 		= this;
	this.returnRaw 	= options.returnRaw || false;
	this.app 		= options.app 		|| {};
	this.onAuth 	= options.onAuth 	|| function() {};
	this.url		= options.url		|| 'http://127.0.0.1';
	this.logout		= options.logout	|| {url: '/logout', after:	'/'};
	
	
	// Special Cases
	// PassportJS doesn't have a standardized API, with its property names changing from Strategy to Strategy.
	// Here we fix that, taking social-login's standardized API and turning it into what Passportjs expects.
	this.specialCases = {
		twitter:	{
			setup:	{
				userAuthorizationURL: 	"https://api.twitter.com/oauth/authorize",
			},
			varChanges:	{
				clientID:		'consumerKey',
				clientSecret:	'consumerSecret'
			}
		},
		linkedin:	{
			varChanges:	{
				clientID:		'consumerKey',
				clientSecret:	'consumerSecret'
			}
		},
		google:	{
			// varChanges:	{
			// 	clientID:		'consumerKey',
			// 	clientSecret:	'consumerSecret'
			// },
			// varAdd:	{
			// 	returnURL:	function(settings) {return scope.url+settings.url.callback;},
			// 	realm:		function(settings) {return scope.url+'/';},
			// }
		},
		meetup:	{
			varChanges:	{
				clientID:		'consumerKey',
				clientSecret:	'consumerSecret'
			}
		},
		tumblr:	{
			varChanges:	{
				clientID:		'consumerKey',
				clientSecret:	'consumerSecret'
			}
		}
	};
	
	// The strategy aliases
	this.map		= {
		facebook:		FacebookStrategy,
		twitter:		TwitterStrategy,
		instagram:		InstagramStrategy,
		linkedin:		LinkedInStrategy,
		github:			GitHubStrategy,
		google:			GoogleStrategy,
		amazon:			AmazonStrategy,
		dropbox:		dropBoxStrategy,
		foursquare:		FoursquareStrategy,
		imgur:			ImgurStrategy,
		meetup:			MeetupStrategy,
		wordpress:		WordpressStrategy,
		tumblr:			TumblrStrategy
	};
	
	this.uniqueIds = {
		facebook:		'id',
		twitter:		'id',
		instagram:		'id',
		linkedin:		'id',
		github:			'id',
		google:			'id',
		amazon:			'id',
		dropbox:		'id',
		foursquare:		'id',
		imgur:			'id',
		meetup:			'id',
		wordpress:		'ID',
		tumblr:			'name'
	};
	
	// The strategy names
	// Some passport libs have more complex internal names than just the name of the service.
	this.strategyNameMap = {
		dropbox:	'dropbox-oauth2'
	};
}
socialLoginClass.prototype.use = function(settings) {
	this.settings = settings;
	this.init();
}
socialLoginClass.prototype.init = function() {
	var scope = this;
	
	// Setup PassportJS
	this.app.use(passport.initialize());
	this.app.use(passport.session());
	passport.serializeUser(function(user, done) {
	  done(null, user);
	});
	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});
	
	this.app.get(this.logout.url, function(req, res){
		res.clearCookie('session_key');
		req.logout();
		res.redirect(scope.logout.after);
	});
	
	var type;
	for (type in this.settings) {
		this.setup(type, this.settings[type]);
	}
	
	
	// Setup the cache
	var caching = function(ttl) {
		this.ttl 	= ttl;
		this.cache 	= {};
		var scope = this;
		setInterval(function() {
			var i;
			var t = new Date().getTime();
			for (i in scope.cache) {
				if (scope.cache[i].expires < t) {
					delete scope.cache[i];
				}
			}
		}, this.ttl/2);
	};
	caching.prototype.set = function(label, value) {
		//Gamify.log("set()", [label, value]);
		var expires = new Date().getTime()+this.ttl;
		this.cache[label] = {
			data:		value,
			expires:	expires
		}
		return expires;
	}
	caching.prototype.get = function(label) {
		if (this.cache[label]) {
			return this.cache[label].data;
		}
		return null;
	};
	caching.prototype.clear = function(label) {
		//Gamify.log("clear",label);
		delete this.cache[label];
	};
	
	this.cache = new caching(1000*20);	// 20sec session caching
	
}
socialLoginClass.prototype.setup = function(type, settings) {
	//toolset.log("Setting up:", type);
	var scope = this;
	if (!this.map[type]) {
		toolset.error("Error!",'type "'+type+'" is not supported.');
		return false;
	}
	
	// Passport setup
	var passportSetup = {
		clientID: 			settings.settings.clientID,
		clientSecret: 		settings.settings.clientSecret,
		callbackURL: 		this.url+settings.url.callback,
		passReqToCallback: 	true
	};
	// Update the variable names if needed, because Passport is unable to standardize things apparently.
	if (this.specialCases[type] && this.specialCases[type].varChanges) {
		var varname;
		for (varname in this.specialCases[type].varChanges) {
			(function(varname) {
				// Save a copy
				var buffer 	= passportSetup[varname];
				
				// Create the new property
				passportSetup[scope.specialCases[type].varChanges[varname]] = buffer;
				
				/// Remove the original data
				delete passportSetup[varname];
			})(varname);
		}
	}
	
	// Add new non-standard variables
	if (this.specialCases[type] && this.specialCases[type].varAdd) {
		var varname;
		for (varname in this.specialCases[type].varAdd) {
			(function(varname) {
				passportSetup[varname] = scope.specialCases[type].varAdd[varname](settings);
			})(varname);
		}
	}
	// Extend the settings if needed
	if (this.specialCases[type] && this.specialCases[type].setup) {
		passportSetup = _.extend(passportSetup, this.specialCases[type].setup);
	}
	
	//toolset.log("passportSetup", passportSetup);
	
	// Execute the passport strategy
	//passport.use(new (this.map[type])(passportSetup, settings.methods.auth));
	passport.use(new (this.map[type])(passportSetup, function (req, accessToken, refreshToken, profile, done) {
		scope.onAuth(req, type, scope.uniqueIds[type], accessToken, refreshToken, scope.returnRaw?profile:scope.preparseProfileData(type, profile), done);
	}));
	
	var strategyName = type;
	if (this.strategyNameMap[type]) {
		strategyName = this.strategyNameMap[type]
	}
	
	// Setup the enty point (/auth/:service)
	this.app.get(settings.url.auth, passport.authenticate(strategyName, settings.settings.authParameters || {}));
	
	// Setup the callback url (/auth/:service/callback)
	//toolset.log("strategyName", strategyName);
	this.app.get(settings.url.callback, passport.authenticate(strategyName, {
		successRedirect: 	settings.url.success,
		failureRedirect: 	settings.url.fail,
		failureFlash: 		true
	}));
}

// The response is not uniform, making it harder to manage consistent data format accross all the services.
// 
socialLoginClass.prototype.preparseProfileData = function(type, profile) {
	
	//toolset.log("Profile", profile);
	
	
	var data = profile._json;
	
	switch (type) {
		default:
			return data;
		break;
		case "foursquare":
		case "tumblr":
			return data.response.user;
		break;
		case "imgur":
		case "instagram":
			return data.data;
		break;
		case "meetup":
			return data.results[0];
		break;
	}
}

module.exports = socialLoginClass;