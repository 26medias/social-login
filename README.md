# Social-Login #

Social-login is a utility built on top of PassportJS that makes it a lot faster to setup various social logins on your site, without having to deal with PassportJS' complicated and non-standardized API.

Social-login also pre-parse the data to return only the part you care about. It will also return the name of the unique property in the data ('id', 'ID', 'name', ...), so that you can identify the user's account easily.

You can literally setup a social login for 13 social sites in less than 10 minutes, without headache.

## Support ##
You can install the following social logins out of the box:

*   facebook
*   twitter
*   instagram
*   linkedin
*   github
*   google
*   amazon
*   dropbox
*   foursquare
*   imgur
*   meetup
*   wordpress
*   tumblr

## install ##
`npm install social-login`

## setup ##
```
// Setup express
var express     	    = require('express');
var app                 = express();
// Setup express here...


// Setup social-login
var socialLoginClass    = require("social-login");

// Init
var socialLogin			= new socialLoginClass({
	app:	app,    // ExpressJS instance
	url:	'http://127.0.0.1:5000',  // Your root url
    onAuth:	function(req, type, uniqueProperty, accessToken, refreshToken, profile, done) {
		
        // This is the centralized method that is called when the user is logged in using any of the supported social site.
        // Setup once and you're done.
        
        findOrCreate({
			profile:	profile,        // Profile is the user's profile, already filtered to return only the parts that matter (no HTTP response code and that kind of useless data)
			property:	uniqueProperty, // What property in the data is unique: id, ID, name, ...
			type:		type            // What type of login that is: facebook, foursquare, google, ...
		}, function(user) {
			done(null, user);   // Return the user and continue
		});
	}
});

// Setup the various services:
socialLogin.use({
    facebook:	{
		settings:	{
			clientID:		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET",
			authParameters:	{
				scope: 'read_stream,manage_pages'
			}
		},
		url:	{
			auth:		"/auth/facebook",           // The URL to use to login (<a href="/auth/facebook">Login with facebook</a>).
			callback: 	"/auth/facebook/callback",  // The Oauth callback url as specified in your facebook app's settings
			success:	'/',                        // Where to redirect the user once he's logged in
			fail:		'/auth/facebook/fail'       // Where to redirect the user if the login failed or was canceled.
		}
	},
	twitter:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/twitter",
			callback: 	"/auth/twitter/callback",
			success:	'/',
			fail:		'/auth/twitter/fail'
		}
	},
	instagram:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/instagram",
			callback: 	"/auth/instagram/callback",
			success:	'/',
			fail:		'/auth/instagram/fail'
		}
	},
	github:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/github",
			callback: 	"/auth/github/callback",
			success:	'/',
			fail:		'/auth/github/fail'
		}
	},
	linkedin:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET",
			authParameters:	{
				scope: ['r_basicprofile', 'r_emailaddress', 'r_fullprofile', 'r_contactinfo', 'r_network', 'rw_nus']
			}
		},
		url:	{
			auth:		"/auth/linkedin",
			callback: 	"/auth/linkedin/callback",
			success:	'/',
			fail:		'/auth/linkedin/fail'
		}
	},
	google:	{
		settings:	{}, // Google doesn't take any API key or API secret
		url:	{
			auth:		"/auth/google",
			callback: 	"/auth/google/callback",
			success:	'/',
			fail:		'/auth/google/fail'
		}
	},
	amazon:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET",
			authParameters:	{
				scope: ['profile', 'postal_code']
			}
		},
		url:	{
			auth:		"/auth/amazon",
			callback: 	"/auth/amazon/callback",
			success:	'/',
			fail:		'/auth/amazon/fail'
		}
	},
	dropbox:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/dropbox",
			callback: 	"/auth/dropbox/callback",
			success:	'/',
			fail:		'/auth/dropbox/fail'
		}
	},
	foursquare:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/foursquare",
			callback: 	"/auth/foursquare/callback",
			success:	'/',
			fail:		'/auth/foursquare/fail'
		}
	},
	imgur:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/imgur",
			callback: 	"/auth/imgur/callback",
			success:	'/',
			fail:		'/auth/imgur/fail'
		}
	},
	meetup:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/meetup",
			callback: 	"/auth/meetup/callback",
			success:	'/',
			fail:		'/auth/meetup/fail'
		}
	},
	// http://developer.wordpress.com/docs/oauth2/
	wordpress:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/wordpress",
			callback: 	"/auth/wordpress/callback",
			success:	'/',
			fail:		'/auth/wordpress/fail'
		}
	},
	tumblr:	{
		settings:	{
			clientID: 		"YOUR_API_KEY",
			clientSecret: 	"YOUR_API_SECRET"
		},
		url:	{
			auth:		"/auth/tumblr",
			callback: 	"/auth/tumblr/callback",
			success:	'/',
			fail:		'/auth/tumblr/fail'
		}
	}
});
```


## Options ##
Do you need to receive the raw data returned by the Oauth login rather than the filtered one?

Simply pass `returnRaw: true` in the setup parameters:

```
var socialLogin    		= new socialLoginClass({
    returnRaw:  true,   // Set this to true (default: false)
	app:	    app, 
	url:	    'http://127.0.0.1:5000',
    onAuth:	    function(req, type, uniqueProperty, accessToken, refreshToken, profile, done) {
		// 'profile' now contains the raw unfiltered data from the Oauth login.
	}
});
```