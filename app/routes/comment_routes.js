const express = require('express')

// Mongoose models
// good to bring in the Place and Comment models
// since comments are dependent on places
const Place = require('../models/place')
const Comment = require('../models/comment')

// throws custom error
const customErrors = require('../../lib/custom_errors')

// sends 404 when non-existant document is requested
const handle404 = customErrors.handle404

// this is middleware that will remove blank fields from `req.body`, e.g.
// { comment: { title: '', text: 'foo' } } -> { comment: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')

// instantiates router
const router = express.Router()
// NO NEED TO DO INDEX FOR COMMENTS
// GET ALL
// index route /comments
// router.get('/comments', (req, res, next) => {
// 	Comment.find()
// 		// respond with status 200 and JSON of the comments
// 		.then((comments) => res.status(200).json({ comments }))
// 		// if an error occurs, pass it to the handler
// 		.catch(next)
// })

// SHOW
// GET /comments/5a7db6c74d55bc51bdf39793/4b6ca5b63c44ab40ace28682
router.get('/comments/:placeId/:commentId', (req, res, next) => {
	// req.params.id will be set based on the `:id` in the route
	// find a specific place in mongodb
	Place.findById(req.params.placeId)
		.then((place) => {
			// select the comment with the id passed to req parameters
			// from the place's comments subdocument array (place.comments)
			// const comment = place.comments.id(req.params.commentId)

			// return the comment, so it will be passed to the next .then
			// return comment

			// this is a shorter approach, the above approach follows the
			// docs closer
			return place.comments.id(req.params.commentId)
		})
		// sending success or failure
		.then((comment) => res.status(200).json(comment.toJSON()))
		.catch(next)
})

// CREATE
// POST /places
router.post('/comments/:placeId', (req, res, next) => {
	// find a specific place in mongodb
	Place.findById(req.params.placeId)
		.then((place) => {
			// add (push) a new comment subdocument, to our place's comments array
			place.comments.push(req.body.comment)

			// save the comment's parent document (place) so that
			// the comment will be saved to the database
			return place.save()
		})
		// sending success by sending the entire place
        // you dont have to do this this way, I'm just using this for easy testing
		.then((place) => {
			res.status(201).json({ place: place.toObject() })
		})
		.catch(next)
})

// UPDATE
// PATCH /places/<place._id>
router.patch('/comments/:placeId/:commentId', removeBlanks, (req, res, next) => {
	// find the place with user input
	Place.findById(req.params.placeId)
        .then(handle404)
		.then((place) => {
			// find the place's comment with user input
			const comment = place.comments.id(req.params.commentId)
			// update title and content of comment
			const newComment = req.body.comment

            comment.title = newComment.title
            comment.body = newComment.body
			// save the place's updated comment
			return place.save()
		})
		// if that succeeded, return 204 and no JSON
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

// DESTROY
// DELETE /places/5a7db6c74d55bc51bdf39793
router.delete('/comments/:placeId/:commentId', (req, res, next) => {
	// find the place by its id
	Place.findById(req.params.placeId)
        .then(handle404)
		.then((place) => {
			// find the place's comment with the id from user input
			// then remove that comment
			// place.comments.id(req.params.commentId).remove()

			// alternative way to delete
			place.comments.pull(req.params.commentId)

			// save the place
			return place.save()
		})
		// send back 204 and no content if the deletion succeeded
		.then(() => res.sendStatus(204))
		// if an error occurs, pass it to the handler
		.catch(next)
})

module.exports = router
