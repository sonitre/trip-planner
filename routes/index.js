var router = require('express').Router(),
	bluebird = require('bluebird'),
	models = require('../models');

// Home Page
router.get('/', function(req, res, next) {
	console.log('hi.');
	var getData = [
		models.Hotel.find({}).exec(),
		models.Restaurant.find({}).exec(),
		models.ThingToDo.find({}).exec()
	];

	bluebird.all(getData).spread(function(hotels, restaurants, thingsToDo) {
		res.render('index', {
			hotels: hotels,
			restaurants: restaurants,
			thingsToDo: thingsToDo
		});
	}).catch(next);
});

module.exports = router;