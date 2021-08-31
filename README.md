## Trippy NFT Sale Auth Server
server to authenticate requests from client and provide proof for smart contract

### Documentation

#### Server Parameters
* `.env`
  * `VERIFIER_PRIV_KEY`: hex encoded private key of verifier
  * `PROVIDER_ENDPOINT`: infura or other JSON-RPC endpoint
  * `SALE_ADDRESS`: ethereum address of deployed sale contract
  * `METADATA_WAIT`: blocks to wait for until tokenURI can be fetched
* `src/whitelist.env.js`
    ```javascript
    module.exports = [Address]

    ```
    should be simple javascript file which has an array of ethereum addresses as
    its only and direct export. These addresses will be considered whitelisted
* `src/token-uris.env.js`
    ```javascript
    module.exports = [TokenURI]
    ```

    should be simple javascript file which has an array of metadata URIs as
    its only and direct export. These tokenURIs are assumed to be in a random
    order as they will be assigned to the NFTs in their given order. The 3rd URI
    for example will be assigned to the 3rd NFT (tokenId: 2)

#### Endpoints

* `/verifier` __`(GET)`__ 
  * Responses:
    * 400 if the server stored verifier private key does not match the sale contract
      verifier
    * 200 `String`: the address of the verifier

* `/get-whitelist-proof` __`(POST)`__ 
  * Parameters:
    ```javascript
    {
      "address": String // address for which to get whitelist proof
    }

    ```
  * Responses:
    * 400 if address is not a valid ethereum address
    * 403 if the address is not whitelisted
    * 200
    ```javascript
    {
      "signature": String // hex encoded signature ready for web3
    }
    ```

* `/get-metadata-proof` __`(POST)`__ 
  * Parameters:
    ```javascript
    {
      "tokenIds": [Number | String] // tokens for which to get proof
    }
    ```
  * Responses:
    * 400 if `tokenIds` is not an array
    * 400 if `tokenIds` contains non decimal number inputs
    * 400 if `tokenIds` is an empty array
    * 400 if `tokenIds` contains a `tokenId` below 0
    * 401 if `tokenIds` contains a token which was not part of a buy atleast
      `METADATA_WAIT` blocks ago
    * 200
    ```javascript
    {
      "tokenURIs": [String], // corresponding tokenURIs in the order of the provided tokenIds
      "signature": String // hex encoded signature ready for web3
    }
    ```

