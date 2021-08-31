require('dotenv').config()
const Web3 = require('web3')
const SaleContractAbi = require('./sale-contract-abi.js')
const web3 = new Web3(
  process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:7545' : process.env.PROVIDER_ENDPOINT
)

const sale = new web3.eth.Contract(SaleContractAbi, process.env.SALE_ADDRESS)
sale.pastBuys = []
sale.nextUpdateBlock = 'earliest'

sale.fetchPastBuys = async () => {
  const { number: block } = await web3.eth.getBlock('latest')
  if (block < sale.nextUpdateBlock) return
  const events = await sale.getPastEvents('Buy', {
    fromBlock: sale.nextUpdateBlock,
    toBlock: block
  })
  const buys = events.map(({ blockNumber, returnValues }) => ({
    block: blockNumber,
    amount: parseInt(returnValues.amount)
  }))
  console.log('buys: ', buys)
  const accBuys = []
  const pastBuys = sale.pastBuys.length
  let total = pastBuys > 0 ? sale.pastBuys[pastBuys - 1].total : 0
  for (const { block, amount } of buys) {
    total += amount
    accBuys.push({ block, total })
  }
  sale.pastBuys = sale.pastBuys.concat(accBuys)
  sale.nextUpdateBlock = block + 1
  console.log('sale.pastBuys: ', sale.pastBuys)
  console.log('sale.nextUpdateBlock: ', sale.nextUpdateBlock)
}

sale.findLastBuy = (beforeBlock) => {
  let left = 0
  const buys = sale.pastBuys.length
  let right = buys - 1

  const maxSearch = Math.floor(Math.log(buys) / Math.log(2)) + 1
  for (let i = 0; i < maxSearch; i++) {
    const mid = Math.floor((left + right) / 2)
    const buy = sale.pastBuys[mid]
    if (buy.block == beforeBlock) return buy
    if (buy.block > beforeBlock) right = mid - 1
    else left = mid + 1

    if (right < left) {
      if (right == -1) return null
      return sale.pastBuys[right]
    }
  }

  throw new Error('not found')
}

sale.fetchPastBuys()

const verifier = web3.eth.accounts.wallet.add(process.env.VERIFIER_PRIV_KEY)

const keccak256 = (value) => web3.utils.soliditySha3({ type: 'string', value })
const constants = {
  DS_IS_WHITELISTED: keccak256('trippy-nfts.access.is-whitelisted(address)'),
  DS_CAPTCHA_SOLVED: keccak256('trippy-nfts.access.captcha-solved(address)'),
  DS_VALID_METADATA: keccak256('trippy-nfts.verif.valid-metadata(uint256,string)')
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
  const directSig = await web3.eth.sign(hash, verifier.address)
  return adjustSigV(directSig)
}

const createAccountVerify = (domainSeparator) => async (account) => {
  const encoded = web3.eth.abi.encodeParameters(['bytes32', 'address'], [domainSeparator, account])
  return await signData(encoded)
}

const whitelist = createAccountVerify(constants.DS_IS_WHITELISTED)
const captcha = createAccountVerify(constants.DS_CAPTCHA_SOLVED)
const metadata = async (tokenIds, tokenURIs) => {
  const encoded = web3.eth.abi.encodeParameters(
    ['bytes32', 'uint256[]', 'string[]'],
    [constants.DS_VALID_METADATA, tokenIds, tokenURIs]
  )
  return await signData(encoded)
}

module.exports = {
  web3,
  sale,
  verifier,
  verify: {
    whitelist,
    captcha,
    metadata
  }
}
