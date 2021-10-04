require('dotenv').config()
//process.env.NODE_ENV = 'development'
const { sale } = require('./web3')

async function main() {
  const toReadout = [
    'whitelistedSale',
    'publicSale',
    'totalBuys',
    'totalIssued',
    'maxTotal',
    'price',
    'verifier',
    'defaultURI',
    'baseURI',
    'symbol',
    'name'
  ]

  for (const readout of toReadout) {
    const value = await sale.methods[readout]().call()
    console.log(`${readout}:`, value)
  }
}

main().then(() => process.exit(0))
