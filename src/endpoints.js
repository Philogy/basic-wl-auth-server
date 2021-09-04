const express = require('express')
const router = express.Router()
const { verify, web3, verifier, sale } = require('./web3.js')
const SaleContractAbi = require('./sale-contract-abi.js')
const { ApiError, createHandler } = require('./api.js')
const directWhitelist = require('./whitelist.env.js')
const verifyCaptcha = require('./captcha.js')

const whitelist = new Set(directWhitelist.map((address) => address.toLowerCase()))

router.post(
  '/verify-whitelist',
  createHandler(async ({ body }) => {
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
  createHandler(async () => process.env.SALE_ADDRESS)
)

router.get(
  '/sale-contract/abi',
  createHandler(async () => SaleContractAbi)
)

router.post(
  '/verify-captcha',
  createHandler(async ({ body, connection }) => {
    const account = body?.address
    const captcha = body?.captcha
    if (!web3.utils.isHexStrict(account) || account.length !== 42) {
      throw new ApiError(400, `"${account}" is not a valid address`)
    } else if (!captcha) {
      throw new ApiError(400, 'missing captcha')
    }
    const passedCaptcha = await verifyCaptcha(captcha, connection.remoteAddress)
    if (!passedCaptcha) {
      throw new ApiError(403, 'captcha invalid')
    }
    const signature = await verify.captcha(account)
    return { signature }
  })
)

module.exports = router
