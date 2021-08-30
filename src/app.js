require('dotenv').config()
const express = require('express')
const directWhitelist = require('../whitelist.json')
const { verify, web3, verifier } = require('./web3.js')
const { ApiError, createHandler } = require('./api.js')

const app = express()
app.use(express.json())

const port = process.env.PORT || 8081
const mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'

const whitelist = new Set(directWhitelist.map((address) => address.toLowerCase()))

app.post(
  '/get-whitelist-proof',
  createHandler(async ({ body }) => {
    const account = body?.address
    if (!web3.utils.isAddress(account)) {
      throw new ApiError(400, `"${account}" is not a valid address`)
    } else if (!whitelist.has(account.toLowerCase())) {
      throw new ApiError(403, `${account} is not whitelisted`)
    } else {
      const signature = await verify.whitelist(account)
      return { signature }
    }
  })
)

app.get(
  '/verifier',
  createHandler(async () => verifier.address)
)

app.listen(port, () =>
  console.log(`start server on port ${port}; mode: ${mode}; node version: ${process.version}`)
)
