'use strict'

// requiring the mongoose library
const mongoose = require('mongoose')

// Create schema constructor
const Schema = mongoose.Schema

const placeSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    latitude: {
        type: Number, 
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number, 
        required: true,
        min: -180,
        max: 180
    },
    country: {
        type: String, 
        required: false
    },
    // to create a one-to-many relationship, where:
    // ONE person can have MANY places, 
    // best practice is to usa reference 
    owner: {
        // to create a reference, the type should be ObjectId
        type: Schema.Types.ObjectId,
        // ref is the model to use when we 'populate' this info
        // NOTE: populate means replacing the 'owner.id' with a Person document (in this example)
        ref: 'Person'
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
})

const Place = mongoose.model('Place', placeSchema)

module.exports = Place