// require necessary npm packages here
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

// instantiate express application object
const app = express()

//<<<<FORM DATA MIDDLEWARE>>>>
// More here: https://stackoverflow.com/questions/23259168/what-are-express-json-and-express-urlencoded/51844327#:~:text=a.-,express.,use(express.
// allows form data to be processed into req.body
app.use(express.urlencoded({extended: false}))
// tells express to recognize req.body as a json object
app.use(express.json())
app.use(cors())

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// define server and client ports
// used for cors and local port declaration
const serverDevPort = 8000
const clientDevPort = 3000

// establish database connection
mongoose.connect(db)

// set CORS headers on response from this API using the `cors` NPM package
// `CLIENT_ORIGIN` is an environment variable that will be set on Heroku
app.use(cors({ origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}` }))

// define port for API to run on
const port = process.env.PORT || serverDevPort

// log each request as it comes in for debugging using custom middleware
// first require
const requestLogger = require('./lib/request_logger')
app.use(requestLogger)

// register route files here:
const personRoutes = require('./app/routes/person_routes')
const placeRoutes = require('./app/routes/place_routes')

// GET /
app.get('/', (req, res)=> {
  res.send('App is running --> Home route has been hit')
})

// run API on designated port (4741 in this case)
app.listen(port, () => {
  console.log('listening on port ' + port)
})

// needed for testing
module.exports = app