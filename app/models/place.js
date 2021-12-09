'use strict'

// requiring the mongoose library
const mongoose = require('mongoose')

// require the commentSchema so we can create a subdocument array
const commentSchema = require('./comment')

// require the Person model, so if someone tries to populate the
// 'owner' path, then the 'Person' model has already been loaded.
const Person = require('./person')

// Create schema contstructor
const Schema = mongoose.Schema

const placeSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		latitude: {
			type: Number,
			required: true,
			min: -90,
			max: 90,
		},
		longitude: {
			type: Number,
			required: true,
			min: -180,
			max: 180,
		},
		country: {
			type: String,
			required: false,
		},
		// create a subdocument array called `comments`. The format of the
		// comments in this array, are defined by `commentSchema`
		// (title: String, body: String)
		comments: [commentSchema],
		// if we want to add extra schema type options, like required, we can do the following
		// comments: [{ type: commentSchema, required: true }]
		// create a one-to-many relationship, where one person can have many places
		// using references
		owner: {
			// to create a reference, the type should be ObjectId
			type: Schema.Types.ObjectId,
			// ref is the model to use, when we populate the `owner`
			// Note: populate means replacing the `owner id` with a Person document in this example
			ref: 'Person',
		},
	},
	{
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: { virtuals: true },
	}
)

placeSchema.virtual('isNorthernHemisphere').get(function () {
	return this.latitude > 0
})
placeSchema.virtual('isWesternHemisphere').get(function () {
	return this.longitude < 0
})

const Place = mongoose.model('Place', placeSchema)

module.exports = Place
