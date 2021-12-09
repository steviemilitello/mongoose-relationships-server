const express = require('express')

// Mongoose models
const Place = require('../models/place')

// throws custom error
const customErrors = require('../../lib/custom_errors')

// sends 404 when non-existant document is requested
const handle404 = customErrors.handle404

// this is middleware that will remove blank fields from `req.body`, e.g.
// { place: { title: '', text: 'foo' } } -> { place: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiates router
const router = express.Router()
// GET /places
router.get('/places', (req, res, next) => {
	Place.find()
        // ADD POPULATE AFTER SHOWING IT IN SHOW ROUTE 
        .populate('owner', ['firstName', 'lastName'])
		// respond with status 200 and JSON of the places
		.then((places) => res.status(200).json({ places }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /places/5a7db6c74d55bc51bdf39793
router.get('/places/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Place.findById(req.params.id)
        // .populate will show the information of the foreign key reference
        // you can specify which fields to show by passing other arguments
		.populate('owner', ['firstName', 'lastName'])
		.then(handle404)
		// if `findById` is succesful, respond with 200 and "places" JSON
		.then((place) => res.status(200).json({ place }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /places
router.post('/places', (req, res, next) => {
	Place.create(req.body.place)
		// respond to succesful `create` with status 201 and JSON of new "place"
		.then((place) => {
			res.status(201).json({ place: place.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH /places/<place._id>
router.patch('/places/:id', removeBlanks, (req, res, next) => {
	Place.findById(req.params.id)
		.then(handle404)
		.then((place) => {
			// pass the result of Mongoose's `.update` to the next `.then`
			return place.updateOne(req.body.place)
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /places/5a7db6c74d55bc51bdf39793
router.delete('/places/:id', (req, res, next) => {
	Place.findById(req.params.id)
		.then(handle404)
		.then((place) => {
			// delete the place ONLY IF the above didn't throw
			place.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
