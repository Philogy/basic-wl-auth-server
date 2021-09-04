const connect = async () => {
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
  window.setMainAccount(account)
  window.ethereum.on('accountsChanged', ([account]) => window.setMainAccount(account))
}

const saleParamsToArg = (params) => [
  params.price,
  params.start,
  params.end,
  params.userMaxBuys,
  params.totalMaxBuys
]

const deploySale = async (
  { name, symbol, maxTotal, verifier, defaultURI },
  whitelistSale,
  publicSale,
  account
) => {
  const saleContract = await new window.web3.eth.Contract(window.SaleContract.abi)
    .deploy({
      data: window.SaleContract.bytecode,
      arguments: [
        name,
        symbol,
        saleParamsToArg(whitelistSale),
        saleParamsToArg(publicSale),
        maxTotal,
        verifier,
        defaultURI
      ]
    })
    .send({ from: account, gas: 4000000 })
  return saleContract
}

async function main() {
  const web3 = (window.web3 = new Web3(window.ethereum))
  web3.eth.handleRevert = true
  const BN = web3.utils.BN
  const $ = (selector) => document.querySelector(selector)
  const { saleAddress } = await (await fetch('/api/sale-contract')).json()
  window.sale = new web3.eth.Contract(window.SaleContract.abi, saleAddress)

  $('#connect-account').addEventListener('click', () => connect())

  $('#whitelist-buy').addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log('e: ', e)
    if (!window.mainAccount) {
      window.alert('wallet not connected')
      return
    }
    const res = await fetch('/api/get-whitelist-proof', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({ address: window.mainAccount })
    })
    if (res.status === 403) {
      window.alert('not whitelisted')
    } else if (res.status === 200) {
      const { signature } = await res.json()
      const buyAmount = $('#whitelist-buy-amount').value
      const data = await window.sale.methods.whitelistedSale().call()
      const total = new BN(data.params.price).mul(new BN(buyAmount))
      await window.sale.methods
        .doWhitelistBuy(signature)
        .send({ from: window.mainAccount, value: total })
      alert('successfully bought')
    } else {
      window.alert('error occured')
      console.error('error:', res)
      return
    }
  })

  $('#public-buy').addEventListener('submit', async (e) => {
    e.preventDefault()
    console.log('public buy')
  })

  window.setMainAccount = (mainAccount) => {
    window.mainAccount = mainAccount
    $('#account').innerText = mainAccount ? `Connected ${mainAccount}` : 'No account connected'
    $('#connect-account').style.display = mainAccount ? 'none' : 'block'
  }
}

main()
