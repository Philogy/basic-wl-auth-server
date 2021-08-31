require('dotenv').config()
const express = require('express')
const directWhitelist = require('../whitelist.json')
const { verify, web3, verifier, sale } = require('./web3.js')
const { ApiError, createHandler } = require('./api.js')
const allTokenURIs = require('./token-uris.js')

const METADATA_WAIT = parseInt(process.env.METADATA_WAIT)

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
  createHandler(async () => {
    const actualVerifier = await sale.methods.verifier().call()
    if (actualVerifier !== verifier.address)
      throw new ApiError(
        400,
        `verifier mismatch ${verifier.address}, sale verifier: ${actualVerifier}`
      )
    return actualVerifier
  })
)

app.post(
  '/get-metadata-proof',
  createHandler(async ({ body }) => {
    const rawTokenIds = body?.tokenIds
    if (!(rawTokenIds instanceof Array)) {
      throw new ApiError(400, 'tokenIds field required and must be an array')
    }
    const tokenIds = rawTokenIds.map((tokenId) => parseInt(tokenId))
    if (tokenIds.some((tokenId) => isNaN(tokenId))) {
      throw new ApiError(400, 'tokenIds must be numbers or numbers or strings')
    }
    if (tokenIds.length == 0) {
      throw new ApiError(400, 'must provide at least 1 tokenId')
    }
    const lowestTokenId = tokenIds.reduce((a, b) => Math.min(a, b))
    if (lowestTokenId < 0) {
      throw new ApiError(400, 'tokenIds start at 0')
    }
    await sale.fetchPastBuys()
    const latestBlock = sale.nextUpdateBlock - 1
    const earliestBlock = latestBlock - METADATA_WAIT
    const acceptedBuys = sale.findLastBuy(earliestBlock)
    const highestTokenId = tokenIds.reduce((a, b) => Math.max(a, b), -1)
    if (highestTokenId >= acceptedBuys.total) {
      throw new ApiError(
        401,
        `tokens not yet available, latest available: #${acceptedBuys.total - 1}`
      )
    }
    const tokenURIs = tokenIds.map((tokenId) => allTokenURIs[tokenId])
    const signature = await verify.metadata(tokenIds, tokenURIs)
    return {
      tokenURIs,
      signature
    }
  })
)

app.listen(port, () =>
  console.log(`start server on port ${port}; mode: ${mode}; node version: ${process.version}`)
)
