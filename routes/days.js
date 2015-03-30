var dayRouter = require('express').Router(),
	attractionRouter = require('express').Router(),
	bluebird = require('bluebird'),
	models = require('../models');

	// dayRouter.use(function(req,res){
	// 	console.log(req);
	// });
	// GET /days
	dayRouter.get('/', function (req, res) {

    models.Day.find({}, function(err, days){
    	res.json(days);
    });

	});

	// POST /days
	dayRouter.post('/', function (req, res, next) {

    models.Day.create(req.body, function(err, newDay){
    	if(err) return next(err);
    	res.json(newDay);
    });

	});

	dayRouter.param('id', function(req, res, next, id){
		models.Day.find({_id: id}, function(err, day){
			req.day = day;
			next();
		})
	});

	// GET /days/:id
	dayRouter.get('/:id', function (req, res, next) {
	    // serves a particular day as json
    res.json(req.day);

	});

	// DELETE /days/:id
	dayRouter.delete('/:id', function (req, res, next) {
    // deletes a particular day
    req.day.remove(function(err, day){
    	if(err) return next(err);
    	res.status(200);
    });

	});


	// dayRouter.use('/:id', attractionRouter);
	// POST /days/:id/hotel


	attractionRouter.post('/hotel', function (req, res, next) {
    // creates a reference to the hotel
    models.Hotel.find({name: req.body.name}, function(err, hotel){
	  	req.day.hotel = hotel;
	  	req.day.save(function(err, savedDay){
	  		if(err) return next(err);
	  		res.status(200);
	  	});
    });
	});

	// DELETE /days/:id/hotel
	attractionRouter.delete('/hotel', function (req, res, next) {
	    // deletes the reference of the hotel
	    req.day.hotel = {};
	    req.day.save(function(err, removedHotel){
	    	if(err) return next(err);
	    	res.status(200);
	    })
	});
	// POST /days/:id/restaurants
	attractionRouter.post('/restaurants', function (req, res, next) {
	    // creates a reference to a restaurant
	    models.Restaurant.find({name: req.body.name}, function(err, restaurant){
	    	req.day.restaurants.push(restaurant);
	    	req.day.save(function(err, updatedDay){
	    		if(err) return next(err);
	    		res.status(200);
	    	})
	    })
	});
	// DELETE /days/:dayId/restaurants/:restId
	attractionRouter.delete('/restaurant/:id', function (req, res, next) {
	    // deletes a reference to a restaurant
	    req.day.restaurants = req.day.restaurants.filter(function(restaurant){
	    	return restaurant._id !== req.params.id;
	    });

	});
	// POST /days/:id/thingsToDo
	attractionRouter.post('/thingsToDo', function (req, res, next) {
	    // creates a reference to a thing to do
	  	models.ThingToDo.find({name: req.body.name}, function(err, newThing){
	  		req.day.thingsToDo.push(newThing);
	  		req.day.save(function(err, updatedDay){
	  			if(err) return next(err);
	  			res.status(200);
	  		});
	  	})
	});
	// DELETE /days/:dayId/thingsToDo/:thingId
	attractionRouter.delete('/thingsToDo/:id', function (req, res, next) {
	    // deletes a reference to a thing to do
	    req.day.thingsToDo = req.day.thingsToDo.filter(function(thing){
	    	return thing._id !== req.params.id;
	    });
	});



	module.exports = dayRouter;