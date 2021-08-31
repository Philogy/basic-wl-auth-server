const getTimestamp = () => Math.floor(Date.now() / 1000)

async function main() {
  const web3 = new Web3(window.ethereum)
  web3.eth.handleRevert = true
  const BN = web3.utils.BN
  const gasPrice = web3.utils.toWei('1', 'gwei')
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
  let saleContract = new web3.eth.Contract(
    window.SaleContract.abi,
    window.localStorage.getItem('sale-contract')
  )
  document.querySelector('#account-display').innerText = `account: ${account}`
  document.querySelector('#contract-display').innerText = `address: ${saleContract.options.address}`
  document.querySelector('#sig-input').value =
    JSON.parse(window.localStorage.getItem('signatures') ?? '{}')[account] ?? ''

  const start = 0
  const end = getTimestamp() + 365 * 24 * 60 * 60

  const button = document.querySelector('#deploy')
  button.addEventListener('click', async () => {
    console.log('deploying')
    saleContract = await new web3.eth.Contract(window.SaleContract.abi)
      .deploy({
        data: window.SaleContract.bytecode,
        arguments: [
          'Trippy NFT collectibles',
          'TRP',
          [web3.utils.toWei('0.1'), start, end, 80, 100],
          [web3.utils.toWei('0.1'), start, end, 80, 100],
          100,
          '0x3ba1Bb452Fb7CE42F50875435b76bCfCc54C509C',
          'some uri'
        ]
      })
      .send({ from: account, gas: 6000000, gasPrice })
    console.log(`deployed at ${saleContract.options.address}`)
    window.localStorage.setItem('sale-contract', saleContract.options.address)
  })

  document.querySelector('#sig-input').addEventListener('input', (e) => {
    const sigs = JSON.parse(window.localStorage.getItem('signatures') ?? '{}')
    sigs[account] = e.target.value
    window.localStorage.setItem('signatures', JSON.stringify(sigs))
  })

  document.querySelector('#buy').addEventListener('click', async () => {
    const amount = document.querySelector('#amount-input').value
    const sig = document.querySelector('#sig-input').value
    const data = await saleContract.methods.whitelistedSale().call()
    const total = new BN(data.params.price).mul(new BN(amount))
    try {
      const res = await saleContract.methods.doWhitelistBuy(sig).send({
        from: account,
        value: total,
        gasPrice
      })
      console.log('res: ', res)
      window.res = res
    } catch (err) {
      console.error('error occured')
      window.err = err
    }
  })
}

main()
