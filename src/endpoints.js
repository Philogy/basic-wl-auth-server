const express = require('express')
const router = express.Router()
const { verify, web3, verifier, sale } = require('./web3.js')
const { ApiError, createHandler } = require('./api.js')
const directWhitelist = require('./whitelist.env.js')

const whitelist = new Set(directWhitelist.map((address) => address.toLowerCase()))

router.post(
  '/get-whitelist-proof',
  createHandler(async ({ body }) => {
    console.log('body: ', body)
    const account = body?.address
    if (!web3.utils.isHexStrict(account) || account.length !== 42) {
      throw new ApiError(400, `"${account}" is not a valid address`)
    } else if (!whitelist.has(account.toLowerCase())) {
      throw new ApiError(403, `${account} is not whitelisted`)
    } else {
      const signature = await verify.whitelist(account)
      return { signature }
    }
  })
)
router.get(
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

router.get(
  '/sale-contract',
  createHandler(async () => ({ saleAddress: process.env.SALE_ADDRESS }))
)

router.post(
  '/captcha-verify',
  createHandler(async ({ body, connection }) => {
    console.log('body: ', body)
    console.log('connection: ', connection)
    console.log('body.captcha: ', body.captcha)
    throw new ApiError(404, 'still broke')
  })
)

module.exports = router
