var express = require('express'),
	logger = require('morgan')('dev'),
	bodyParser = require('body-parser'),
	swig = require('swig'),
	nodeSass = require('node-sass-middleware');

// Instantiate app
var app = express();

// Swig setup
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', swig.renderFile);

// Sass configuration
var sassMiddleware = nodeSass({
	src: __dirname + '/assets',
	dest: __dirname + '/public',
	debug: true
});
app.use(sassMiddleware);

// Setup static directories
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// Middleware
app.use(logger);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Route handling
app.get('/', require('./routes'));

// No routes were hit > 404 status
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error handling
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	console.log(err);
	res.render('error', { error: err });
});

// Initialize server
app.listen(3000, function() {
	console.log('Trip Planner server is running...');
});