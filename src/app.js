const express = require('express')

const app = express()

const port = process.env.PORT || 8081
const mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'

app.use('/', (req, res) => {
  res.json({ msg: 'this is a complex (not) message' })
})

app.listen(port, () =>
  console.log(`start server on port ${port}; mode: ${mode}; node version: ${process.version}`)
)
