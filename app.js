/**
 * Module dependencies.
 */

var express = require('express');
var util = require('util');
var fs = require('fs');
//var DealRepository = require('./dealrepository-mongodb').DealRepository;
var DealRepository = require('./dealrepository-memory').DealRepository;
var TokenRepository = require('./tokenrepository-memory').TokenRepository;
var UA = require("./lib/urban-airship");
var ua = new UA("xWZjMbfyShygnvcEM573rg", "B1xZzItfQf2dEKKiikFEow", "uQIp7-gOSti3CbXwSCMsRA");

console.log(ua);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

var dealRepository = new DealRepository('localhost', 27017);
var tokenRepository = new TokenRepository();

app.get('/', function(req, res) {
    dealRepository.findAll( function(error, deals){
        res.render('index.jade', { locals: {
            	title: 'Deals',
            	deals:deals
            }
        });
    })
});

app.get('/admin', function(req, res){
    dealRepository.findAll( function(error, deals){
        res.render('index.jade', { locals: {
            	title: 'Deals',
            	deals:deals
            }
        });
    })
});

// WEB SITE ROUNTES

// Show new deal form
app.get('/deal/new', function(req, res) {
    res.render('deal_new.jade', { locals: {
        	title: 'New Deal'
    	}
    });
});

// Post new deal
app.post('/deal/new', function(req, res, next){
	//LK-TBD temporarily disable fiel uplods :()
	if (true || req.files.image.filename == '') {
	    dealRepository.save({
	        title: req.param('title'),
	        body: req.param('body'),
			fileName: ''
	    }, function( error, deals) {
		      res.redirect("/admin")						
		});
	}
	else {
		var storedFileName = req.files.image.filename;
		var ins = fs.createReadStream(req.files.image.path);
	    var ous = fs.createWriteStream(__dirname + '/public/images/' + storedFileName);
	    util.pump(ins, ous, function(err) {
	        if(err) {
			    console.log("file copy error " + err);
	            next(err);
	        } else {
			    console.log("file copy ok");
			    fs.unlinkSync(req.files.image.path);
			    dealRepository.save({
			        title: req.param('title'),
			        body: req.param('body'),
					fileName: storedFileName
			    }, function( error, deals) {
				      res.redirect("/admin")						
				});
	        }
	    });
	}
});

//Show deal page
app.get('/deal/:id', function(req, res) {
    dealRepository.findById(req.params.id, function(error, deal) {
        res.render('deal_show.jade', { locals: {
	            title: deal.title,
	            deal:deal
	        }
        });
    });
});


// Future: Add deal open information from mobile app
app.post('/deal/addOpenInfo', function(req, res) {
    dealRepository.addOpenInfoToDeal(req.param('_id'), {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
       } , function( error, docs) {
           res.redirect('/deal/' + req.param('_id'))
       });
});

// MOBILE APP ROUTES

app.get('/m/deal/:id', function(req, res) {
    dealRepository.findById(req.params.id, function(error, deal) {
		if (deal.fileName == "") {
			deal.fileName = "default.gif"
		}
		console.log(deal)
        res.render('mobile/deal_view.jade', { locals: {
            	title: "Deal Preview",
	            deal:deal
	        }
        });
    });
});

app.get('/m/code/:id', function(req, res) {
    dealRepository.findById(req.params.id, function(error, deal) {
        res.render('mobile/code_view.jade', { locals: {
            	title: "Deal Preview",
	            deal:deal
	        }
        });
    });
});

app.get('/m', function(req, res) {
    dealRepository.findAll( function(error, deals){
        res.render('mobile/home.jade', { locals: {
            	title: 'Deals',
            	deals:deals
            }
        });
    })
});

// Push notification using urban airship wrapper. Note: token comes from application registration.

app.get('/deal/push/:id', function(req, res) {
	tokenRepository.findAll(function(errors, tokens){
		console.log("Push a deal. Token count: " + tokens.length);
		if (tokens.length > 0) {
			ua.pushNotification(tokens, "You have a new deal!", null, null,
									    "/m/deal/" + req.params.id, function(error) {
				console.log("error: " + error);
				res.redirect("/admin");
			});
		}
		else
			res.redirect("/admin");
	});
});

// Valled by the device to register its APNS token with this application
app.get('/device/register/:token', function(req, res) {
	var token = req.params.token;
	console.log("incoming token: " + token);
	if (typeof token != "undefined" && token != null && token != "") {
		ua.registerDevice(token, function(error) {
			if (error == null) {
				tokenRepository.save(token, function(errors, tokens){
					console.log("Registered token. New token count: " + tokens.length);	
					res.redirect("/");				
				});
			}
			else {
				res.redirect("/");
			}
		});		
	}
	else {
		res.redirect("/");
	}
});

app.get('/device/removeall', function(req, res) {
	tokenRepository.removeAll(function(errors, tokens){
		console.log("Remove all. New token count: " + tokens.length);
		res.redirect("/admin");
	});
});


app.listen(3000);

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
