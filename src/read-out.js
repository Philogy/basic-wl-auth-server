require('dotenv').config()
const { web3, sale } = require('./web3')

async function main() {
  const block = await web3.eth.getBlock('latest')
  console.log('block: ', block)
  const whitelistedSale = await sale.methods.whitelistedSale().call()
  console.log('whitelistedSale: ', whitelistedSale)
}

main().then(() => process.exit(0))
