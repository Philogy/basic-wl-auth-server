const getTimestamp = () => Math.floor(Date.now() / 1000)

async function main() {
  const web3 = new Web3(window.ethereum)
  const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
  let saleContract = null
  document.querySelector('#account-display').innerText = `account: ${account}`

  const start = getTimestamp() + 5 * 60
  const end = start + 5 * 60

  const button = document.querySelector('#deploy')
  button.addEventListener('click', async () => {
    console.log('deploying')
    saleContract = await new web3.eth.Contract(window.SaleContract.abi)
      .deploy({
        data: window.SaleContract.bytecode,
        arguments: [
          'Trippy NFT collectibles',
          'TRP',
          [web3.utils.toWei('0.1'), start, end, 5, 8],
          [web3.utils.toWei('0.1'), start, end, 5, 8],
          10,
          '0x3ba1Bb452Fb7CE42F50875435b76bCfCc54C509C',
          'some uri'
        ]
      })
      .send({ from: account, gas: 6000000, gasPrice: web3.utils.toWei('1', 'gwei') })
    console.log('deployed')
  })
}

main()
