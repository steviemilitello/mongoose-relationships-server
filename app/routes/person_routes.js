const express = require('express')

// Mongoose models
const Person = require('../models/person')

// throws custom error
const customErrors = require('../../lib/custom_errors')

// sends 404 when non-existant document is requested
const handle404 = customErrors.handle404

// this is middleware that will remove blank fields from `req.body`, e.g.
// { person: { title: '', text: 'foo' } } -> { person: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiates router
const router = express.Router()
// GET /people
router.get('/people', (req, res, next) => {
	Person.find()
		// respond with status 200 and JSON of the people
		.then((people) => res.status(200).json({ people }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// SHOW
// GET /people/5a7db6c74d55bc51bdf39793
router.get('/people/:id', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	Person.findById(req.params.id)
		.then(handle404)
		// if `findById` is successful, respond with 200 and "people" JSON
		.then((person) => res.status(200).json({ person }))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// CREATE
// POST /people
router.post('/people', (req, res, next) => {

	Person.create(req.body.person)
		// respond to successful `create` with status 201 and JSON of new "person"
		.then((person) => {
			res.status(201).json({ person: person.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH /people/<person._id>
router.patch('/people/:id', removeBlanks, (req, res, next) => {

		Person.findById(req.params.id)
			.then(handle404)
			.then((person) => {
				// pass the result of Mongoose's `.update` to the next `.then`
				return person.updateOne(req.body.person)
			})
			// if that succeeded, return 204 and no JSON
			.then(() => res.sendStatus(204))
			// if an error occurs, pass it to the handler
			.catch(next)
	}
)

// DESTROY
// DELETE /people/5a7db6c74d55bc51bdf39793
router.delete('/people/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(handle404)
		.then((person) => {
			// delete the person ONLY IF the above didn't throw
			person.deleteOne()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router