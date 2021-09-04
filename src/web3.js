require('dotenv').config()
const Web3 = require('web3')
const SaleContractAbi = require('./sale-contract-abi.js')
const web3 = new Web3(
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7545' : process.env.PROVIDER_ENDPOINT
)

const sale = new web3.eth.Contract(SaleContractAbi, process.env.SALE_ADDRESS)
const verifier = web3.eth.accounts.wallet.add(process.env.VERIFIER_PRIV_KEY)

const keccak256 = (value) => web3.utils.soliditySha3({ type: 'string', value })
const constants = {
  DS_IS_WHITELISTED: keccak256('trippy-nfts.access.is-whitelisted(address)'),
  DS_CAPTCHA_SOLVED: keccak256('trippy-nfts.access.captcha-solved(address)')
}

const adjustSigV = (sig) => {
  const rs = sig.slice(0, -2)
  let v = parseInt(sig.slice(-2), 16)
  if (v !== 27 && v !== 28) {
    v += 27
  }
  return rs + v.toString(16)
}

const signData = async (encodedData) => {
  const hash = web3.utils.soliditySha3(encodedData)
  const { signature } = await verifier.sign(hash)
  return adjustSigV(signature)
}

const createAccountVerify = (domainSeparator) => async (account) => {
  const encoded = web3.eth.abi.encodeParameters(['bytes32', 'address'], [domainSeparator, account])
  return await signData(encoded)
}

const whitelist = createAccountVerify(constants.DS_IS_WHITELISTED)
const captcha = createAccountVerify(constants.DS_CAPTCHA_SOLVED)

module.exports = {
  web3,
  sale,
  verifier,
  verify: {
    whitelist,
    captcha
  }
}
