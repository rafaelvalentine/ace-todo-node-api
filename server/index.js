// require env config
require('./config/config')
    // module imports
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors');
// const path = require('path')

// local imports
const { connectToDB } = require('./database')
const BaseRoute = require('./routes')

const app = express()
app.use(cors());
const port = process.env.PORT
    // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(morgan('combined'))
app.use(helmet())
    // app.get('/', (req, res) => res.send('Hello World!'))
app.use('/api/v1', BaseRoute)
    // if (process.env.NODE_ENV === 'production') {
    //     // Set static folder.
    //     app.use(express.static('client/build/'))
    //     app.get(/.*/, (req, res) => {
    //         res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    //     })
    // }
app.listen(port, () => {
    connectToDB()
    console.log(`App listening on port ${port}!`)
})

module.exports = { app }