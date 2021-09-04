require('dotenv').config()
const path = require('path')
const express = require('express')
const apiEndpoints = require('./endpoints.js')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const app = express()

app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = process.env.PORT || 8081
const mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'

const staticPath = path.join(__dirname, mode === 'dev' ? '../test-page' : '../page')
const staticMiddleware = express.static(staticPath)

app.use(staticMiddleware)
app.use('/api', apiEndpoints)

app.listen(port, () =>
  console.log(`start server on port ${port}; mode: ${mode}; node version: ${process.version}`)
)
