## Basic NFT Whitelist Auth Server
server to authenticate requests from client and provide proof for smart contract

### Documentation

#### Server Parameters
* `.env`
  * `VERIFIER_PRIV_KEY`: hex encoded private key of verifier
  * `PROVIDER_ENDPOINT`: infura or other JSON-RPC endpoint
  * `SALE_ADDRESS`: ethereum address of deployed sale contract
  * `RECAPTCHA_SECRET`: recaptcha server-side secret provided by google
* `src/whitelist.env.js`

    ```javascript
    module.exports = [Address]
    ```
    should be simple javascript file which has an array of ethereum addresses as
    its only and direct export. These addresses will be considered whitelisted

#### Endpoints

* `/` **`(GET)`**

  will serve static files contained in the `/page` or `/test-page` directory
  depending on whether the api is run in development mode or not

* `/verifier` __`(GET)`__
  * Responses:
    * 400 if the server stored verifier private key does not match the sale contract
      verifier
    * 200 `String`: the address of the verifier

* `/sale-contract` __`(GET)`__ 
  * Responses:
    * 200 `String`: the address of the sale contract

* `/sale-contract/abi` __`(GET)`__ 
  * Responses:
    * 200 `Object`: the ABI of the sale contract

* `/verify-whitelist` __`(POST)`__ 
  * Parameters:
    ```javascript
    {
      "address": String // address for which to get whitelist proof
    }

    ```
  * Responses:
    * 400 if address is not a valid ethereum address
    * 403 if the address is not whitelisted
    * 200 if the address is valid and contained within the whitelist
    ```javascript
    {
      "signature": String // hex encoded signature ready for web3
    }

* `/verify-captcha` __`(POST)`__ 
  * Parameters:
    ```javascript
    {
      "address": String, // address for which to validate captcha
      "captcha": String // captcha .value provided by the captcha element
    }

    ```
  * Responses:
    * 400 if address is not a valid ethereum address
    * 400 if the captcha field is empty or missing
    * 403 if the captcha failed to verify
    * 200 if the captcha and address are valid
    ```javascript
    {
      "signature": String // hex encoded signature ready for web3
    }
    ```
